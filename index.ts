import type { DocNode as AdfDoc } from "@atlaskit/adf-schema";
import type { Content as MdastContent, Root as MdastRoot } from "mdast";

const blocks: Record<string, (adf: any) => MdastContent> = {
  blockquote: () => ({ type: "blockquote", children: [] }),
  bulletList: () => ({ type: "list", ordered: false, children: [] }),
  codeBlock: () => ({ type: "code", value: "" }),
  heading: (adf) => ({ type: "heading", depth: adf.attrs.level, children: [] }),
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

const inline: Record<string, (adf: any) => MdastContent> = {
  // emoji
  hardBreak: () => ({ type: "break" }),
  // inlineCard
  // mention
  text: (adf) => mark({ type: "text", value: adf.text }, adf.marks),
};

const markings: Record<
  string,
  (adf: any, mark: { type: string; attrs?: {} }) => MdastContent
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

export default function convert(doc: AdfDoc): MdastRoot {
  // assert(doc.version === 1)

  const tree: MdastRoot = { type: "root", children: [] };

  const stack: [MdastRoot | MdastContent, any[]][] = [[tree, doc.content]];

  while (stack.length > 0) {
    const [node, queue] = stack[stack.length - 1];

    if (queue.length === 0) {
      stack.pop();

      const [parent] = stack[stack.length - 1] || [];
      if (parent && "children" in parent) parent.children.push(node);

      continue;
    }

    const adf = queue.shift();

    if (adf.content) {
      const map = blocks[adf.type as keyof typeof blocks];
      stack.push([map(adf), adf.content]);
      continue;
    }

    if ("children" in node) {
      const map = inline[adf.type as keyof typeof inline];
      node.children.push(map(adf));
    } else if ("value" in node) {
      node.value += node.text; // map();
    }
  }

  return tree;
}
