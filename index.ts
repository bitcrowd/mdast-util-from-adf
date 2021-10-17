import type {
  DocNode as ADFDoc,
  HeadingDefinition as ADFHeading,
} from "@atlaskit/adf-schema";
import type {
  Content as MDASTContent,
  Parent as MDASTParent,
  Root as MDASTRoot,
} from "mdast";

type ADFContent = ADFDoc["content"];
type ADFNode = ADFContent[number];
type ADFType = ADFNode["type"];

type MDASTNode = MDASTRoot | MDASTContent;
type MDASTParents = Extract<MDASTContent, MDASTParent>;
type MDASTParentNode = MDASTParents & { children: MDASTContent[] };

type StackEntry<Node extends MDASTNode> = [Node, ADFNode[]];
type Stack = [StackEntry<MDASTRoot>, ...StackEntry<MDASTParentNode>[]];

// const panels = {
//   info: "ℹ",
//   note: "",
//   tip: "",
//   warning: "⚠",
//   error: "𐄂",
//   success: "✔",
// };

const blocks: Record<ADFType, (_: ADFNode) => MDASTContent> = {
  blockquote: () => ({ type: "blockquote", children: [] }),
  bulletList: () => ({ type: "list", ordered: false, children: [] }),
  codeBlock: () => ({ type: "code", value: "" }),
  heading: (adf) => ({
    type: "heading",
    depth: (adf as ADFHeading).attrs.level as 1 | 2 | 3 | 4 | 5 | 6,
    children: [],
  }),
  listItem: () => ({ type: "listItem", children: [] }),
  // mediaGroup: () => ({ type: "list", children: [] }),
  // mediaSingle
  // media
  orderedList: () => ({ type: "list", ordered: true, children: [] }),
  // panel
  paragraph: () => ({ type: "paragraph", children: [] }),
  rule: () => ({ type: "thematicBreak" }),
  table: () => ({ type: "table", children: [] }),
  table_cell: () => ({ type: "tableCell", children: [] }),
  table_header: () => ({ type: "tableCell", children: [] }),
  table_row: () => ({ type: "tableRow", children: [] }),
};

const inline: Record<string, (_: ADFNode) => MDASTContent> = {
  // emoji
  hardBreak: () => ({ type: "break" }),
  // inlineCard
  // mention
  text: (adf) => mark({ type: "text", value: adf.text }, adf.marks),
};

const markings: Record<
  string,
  (adf: ADFNode, mark: { type: string; attrs?: {} }) => MDASTContent
> = {
  subsup: (node, mark) => ({
    ...node,
    type: "html",
    value: `<${mark.attrs.type}>${node.value}</${mark.attrs.type}>`,
  }),
  textColor: (node) => node,
  underline: (node) => node,

  code: (node) => ({ ...node, type: "inlineCode" }),

  em: (node) => ({ type: "emphasis", children: [node] }),
  link: (node, mark) => ({
    type: "link",
    url: mark.attrs.href,
    children: [node],
  }),
  strike: (node) => ({ type: "delete", children: [node] }), // gfm
  strong: (node) => ({ type: "strong", children: [node] }),
};

const mark = (node, marks = []) => {
  const order = Object.keys(markings);
  const apply = [...marks];
  apply.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  return apply.reduce((n, mark) => markings[mark.type](n, mark), node);
};

class AssertionError extends Error {}

function assert(value: unknown, message = ""): asserts value {
  if (!value) throw new AssertionError(message);
}

export default function convert(doc: ADFDoc): MDASTRoot {
  assert(doc.version === 1, "unknown document version");

  const tree: MDASTRoot = { type: "root", children: [] };
  const stack: Stack = [[tree, doc.content]];

  while (stack.length > 0) {
    const index = stack.length - 1;
    const [node, queue] = stack[index];

    if (queue.length === 0) {
      if (index === 0) break; // root node queue is empty, we’re done
      const parent = stack[index - 1][0];
      parent.children.push(node as MDASTParentNode);
      stack.pop();
      continue;
    }

    const adf = queue.shift();
    assert(adf);

    if (adf.type in blocks && "content" in adf) {
      const mapped = blocks[adf.type](adf);
      stack.push([mapped, adf.content]);
    } else if (adf.type in inline) {
      const map = inline[adf.type];
      assert("children" in node);
      node.children.push(map(adf));
    } else {
      throw new Error(`Unknown ADF node type: ${adf.type}`);
    }
  }

  return tree;
}
