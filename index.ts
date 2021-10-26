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
  Link as MDASTLink,
  Parent as MDASTParent,
  PhrasingContent as MDASTPhrasingContent,
  Root as MDASTRoot,
} from "mdast";

type ADFMark<Attributes = any> = { type: string; attrs?: Attributes };
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

/* eslint-disable no-unused-vars */
type Marker = (
  node: MDASTPhrasingContent,
  mark: ADFMark
) => MDASTPhrasingContent;
/* eslint-enable no-unused-vars */

const markers: Record<string, Marker> = {
  // markers which change node type - these should be applied first
  code: (node) => ("value" in node ? { ...node, type: "inlineCode" } : node),

  // markers which wrap the node
  em: (node) => ({ type: "emphasis", children: [node] }),
  link: (node, mark: ADFMark<{ href: string }>) => ({
    type: "link",
    url: mark.attrs!.href,
    children: [node as MDASTLink["children"][number]],
  }),
  strike: (node) => ({ type: "delete", children: [node] }), // GFM
  strong: (node) => ({ type: "strong", children: [node] }),
};

const order = Object.keys(markers);

function mark(node: MDASTPhrasingContent, marks: ADFMark[] = []) {
  return marks
    .slice()
    .filter((m) => order.includes(m.type))
    .sort((m1, m2) => order.indexOf(m1.type) - order.indexOf(m2.type))
    .reduce((n, m) => markers[m.type](n, m), node);
}

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
