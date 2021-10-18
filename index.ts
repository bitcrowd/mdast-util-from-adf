import type {
  BlockContent as ADFBlockContent,
  DocNode as ADFDoc,
  HeadingDefinition as ADFHeading,
  Inline as ADFInlineContent,
  LayoutColumnDefinition as ADFLayoutColumn,
  ListItemDefinition as ADFListItem,
  MediaDefinition as ADFMedia,
  TableCellDefinition as ADFTableCell,
  TableHeaderDefinition as ADFTableHeader,
  TableRowDefinition as ADFTableRow,
  TextDefinition as ADFText,
} from "@atlaskit/adf-schema";
import type {
  Content as MDASTContent,
  Parent as MDASTParent,
  Root as MDASTRoot,
} from "mdast";

type ADFNode =
  | ADFDoc["content"][number]
  | ADFBlockContent
  | ADFInlineContent
  | ADFLayoutColumn
  | ADFListItem
  | ADFMedia
  | ADFTableCell
  | ADFTableHeader
  | ADFTableRow;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, no-unused-vars
const mappings: Record<ADFType, ((_: any) => MDASTContent) | undefined> = {
  blockCard: undefined,
  blockquote: () => ({ type: "blockquote", children: [] }),
  bodiedExtension: undefined,
  bulletList: () => ({ type: "list", ordered: false, children: [] }),
  codeBlock: () => ({ type: "code", value: "" }),
  date: undefined,
  decisionList: undefined,
  embedCard: undefined,
  emoji: undefined,
  expand: undefined,
  extension: undefined,
  hardBreak: () => ({ type: "break" }),
  heading: (adf: ADFHeading) => ({
    type: "heading",
    depth: adf.attrs.level as 1 | 2 | 3 | 4 | 5 | 6,
    children: [],
  }),
  inlineCard: undefined,
  inlineExtension: undefined,
  layoutColumn: undefined,
  layoutSection: undefined,
  listItem: () => ({ type: "listItem", children: [] }),
  media: undefined,
  mediaGroup: undefined,
  mediaInline: undefined,
  mediaSingle: undefined,
  mention: undefined,
  orderedList: () => ({ type: "list", ordered: true, children: [] }),
  panel: undefined,
  paragraph: () => ({ type: "paragraph", children: [] }),
  placeholder: undefined,
  rule: () => ({ type: "thematicBreak" }),
  status: undefined,
  table: () => ({ type: "table", children: [] }),
  tableCell: () => ({ type: "tableCell", children: [] }),
  tableHeader: () => ({ type: "tableCell", children: [] }),
  tableRow: () => ({ type: "tableRow", children: [] }),
  taskList: undefined,
  text: (adf: ADFText) =>
    mark({ type: "text", value: adf.text }, adf.marks ?? []),
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

    const adf = queue.shift()!;

    const map = mappings[adf.type];
    assert(map, "unsupported node type");

    const mapped = map(adf);

    if ("children" in mapped && "content" in adf) {
      const content = adf.content as Array<ADFNode>;
      stack.push([mapped, content]);
    } else {
      node.children.push(mapped);
    }
  }

  return tree;
}
