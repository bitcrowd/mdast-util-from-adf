import type {
  BlockCardDefinition as ADFBlockCard,
  BlockContent as ADFBlockContent,
  BlockQuoteDefinition as ADFBlockQuote,
  BulletListDefinition as ADFBulletList,
  CodeBlockBaseDefinition as ADFCodeBlock,
  DateDefinition as ADFDate,
  DecisionItemDefinition as ADFDecisionItem,
  DecisionListDefinition as ADFDecisionList,
  DocNode as ADFDoc,
  EmbedCardDefinition as ADFEmbedCard,
  EmojiDefinition as ADFEmoji,
  HeadingBaseDefinition as ADFHeading,
  Inline as ADFInlineContent,
  InlineCardDefinition as ADFInlineCard,
  LayoutColumnDefinition as ADFLayoutColumn,
  LayoutSectionDefinition as ADFLayoutSection,
  ListItemDefinition as ADFListItem,
  MediaDefinition as ADFMedia,
  MentionDefinition as ADFMention,
  NestedExpandDefinition as ADFNestedExpand,
  OrderedListDefinition as ADFOrderedList,
  PanelDefinition as ADFPanel,
  ParagraphBaseDefinition as ADFParagraph,
  RuleDefinition as ADFRule,
  TableCellDefinition as ADFTableCell,
  TableDefinition as ADFTable,
  TableHeaderDefinition as ADFTableHeader,
  TableRowDefinition as ADFTableRow,
  TaskItemDefinition as ADFTaskItem,
  TaskListDefinition as ADFTaskList,
  TextDefinition as ADFText,
} from "@atlaskit/adf-schema";
import type {
  Blockquote as MDASTBlockquote,
  Content as MDASTContent,
  Delete as MDASTDelete,
  Emphasis as MDASTEmphasis,
  Heading as MDASTHeading,
  Link as MDASTLink,
  List as MDASTList,
  ListItem as MDASTListItem,
  Literal as MDASTLiteral,
  Paragraph as MDASTParagraph,
  Parent as MDASTParent,
  Root as MDASTRoot,
  Strong as MDASTStrong,
  Table as MDASTTable,
  TableCell as MDASTTableCell,
  TableRow as MDASTTableRow,
} from "mdast";
import { u } from "unist-builder";

type ADFNode =
  | ADFDoc["content"][number]
  | ADFBlockCard
  | ADFBlockContent
  | ADFBlockQuote
  | ADFBulletList
  | ADFCodeBlock
  | ADFDate
  | ADFDecisionItem
  | ADFDecisionList
  | ADFEmbedCard
  | ADFEmoji
  | ADFHeading
  | ADFInlineCard
  | ADFInlineContent
  | ADFLayoutColumn
  | ADFLayoutSection
  | ADFListItem
  | ADFMedia
  | ADFMention
  | ADFNestedExpand
  | ADFOrderedList
  | ADFPanel
  | ADFParagraph
  | ADFRule
  | ADFTable
  | ADFTableCell
  | ADFTableHeader
  | ADFTableRow
  | ADFTaskItem
  | ADFTaskList
  | ADFText;
type ADFType = ADFNode["type"];

type MDASTNode = MDASTParent | MDASTLiteral;
type MDASTParents = Extract<MDASTNode, MDASTParent>;
type MDASTParentNode = MDASTParents & { children: MDASTContent[] };

type StackEntry<Node extends MDASTNode> = [ADFNode, Node][];
type Stack = [StackEntry<MDASTRoot>, ...StackEntry<MDASTParentNode>[]];

const mappings: Record<
  ADFType,
  | ((_: any, __: MDASTParentNode) => StackEntry<MDASTParentNode> | void)
  | undefined
> = {
  blockCard: (adf: ADFBlockCard, parent) => {
    parent.children.push(
      u("paragraph", [
        u(
          "text",
          "url" in adf.attrs ? adf.attrs.url : JSON.stringify(adf.attrs.data)
        ),
      ])
    );
  },
  blockquote: (adf: ADFBlockQuote, parent) => {
    const node: MDASTBlockquote = u("blockquote", []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  bodiedExtension: undefined,
  bulletList: (adf: ADFBulletList, parent) => {
    // TODO: Can we share code with ordered list?
    const node: MDASTList = u("list", { ordered: false, spread: false }, []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  codeBlock: (adf: ADFCodeBlock, parent) => {
    const value = adf.content?.[0]?.text ?? "";
    const lang = adf.attrs?.language;
    parent.children.push(u("code", { lang }, value));
  },
  date: (adf: ADFDate, parent) => {
    parent.children.push(u("text", adf.attrs.timestamp));
  },
  decisionItem: (adf: ADFDecisionItem, parent) => {
    // TODO: See whether we can refactor this, task item is similar
    const paragraph: MDASTParagraph = u("paragraph", []);
    const node: MDASTListItem = u(
      "listItem",
      { spread: false, checked: adf.attrs.state === "DECIDED" },
      [paragraph]
    );
    parent.children.push(node);
    return adf.content?.map((n) => [n, paragraph]);
  },
  decisionList: (adf: ADFDecisionList, parent) => {
    // TODO: See whether we can refactor this, task list is similar
    const node: MDASTList = u("list", { ordered: false, spread: false }, []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  embedCard: (adf: ADFEmbedCard, parent) => {
    const { url } = adf.attrs;
    const link = u("link", { url }, [u("text", url)]);
    parent.children.push(link);
  },
  emoji: (adf: ADFEmoji, parent) => {
    parent.children.push(u("text", adf.attrs.text ?? adf.attrs.shortName));
  },
  expand: undefined,
  extension: undefined,
  hardBreak: (adf, parent) => {
    parent.children.push(u("break"));
  },
  heading: (adf: ADFHeading, parent) => {
    const depth = adf.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;
    const node: MDASTHeading = u("heading", { depth }, []);
    parent.children.push(node);
    return adf.content?.map((n) => [n, node]);
  },
  inlineCard: (adf: ADFInlineCard, parent) => {
    parent.children.push(
      u(
        "text",
        "url" in adf.attrs ? adf.attrs.url : JSON.stringify(adf.attrs.data)
      )
    );
  },
  inlineExtension: undefined,
  layoutColumn: (adf: ADFLayoutColumn, parent) => {
    return adf.content.map((n) => [n, parent]);
  },
  layoutSection: (adf: ADFLayoutSection, parent) => {
    return adf.content.map((n) => [n, parent]);
  },
  listItem: (adf: ADFListItem, parent) => {
    const node: MDASTListItem = u("listItem", { spread: false }, []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  media: (adf: ADFMedia, parent) => {
    const key = "url" in adf.attrs ? adf.attrs.url : adf.attrs.id;
    parent.children.push(u("html", `<!-- media: ${adf.attrs.type} ${key} -->`));
  },
  mediaGroup: (adf, parent) => {
    return adf.content.map((n: ADFMedia) => [n, parent]);
  },
  mediaInline: undefined,
  mediaSingle: (adf, parent) => {
    return adf.content.map((n: ADFMedia) => [n, parent]);
  },
  mention: (adf: ADFMention, parent) => {
    parent.children.push(u("text", `@${adf.attrs.text}`));
  },
  nestedExpand: undefined,
  orderedList: (adf: ADFOrderedList, parent) => {
    const node: MDASTList = u("list", { ordered: true, spread: false }, []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  panel: (adf: ADFPanel, parent) => {
    return adf.content.map((n) => [n, parent]);
  },
  paragraph: (adf: ADFParagraph, parent) => {
    const node: MDASTParagraph = u("paragraph", []);
    parent.children.push(node);
    return adf.content?.map((n) => [n, node]);
  },
  placeholder: undefined,
  rule: (adf: ADFRule, parent) => {
    parent.children.push(u("thematicBreak"));
  },
  status: undefined,
  table: (adf: ADFTable, parent) => {
    const node: MDASTTable = u("table", []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  tableCell: (adf: ADFTableCell, parent) => {
    const node: MDASTTableCell = u("tableCell", []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  tableHeader: (adf: ADFTableHeader, parent) => {
    const node: MDASTTableCell = u("tableCell", []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  tableRow: (adf: ADFTableRow, parent) => {
    const node: MDASTTableRow = u("tableRow", []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  taskItem: (adf: ADFTaskItem, parent) => {
    const paragraph: MDASTParagraph = u("paragraph", []);
    const node: MDASTListItem = u(
      "listItem",
      { spread: false, checked: adf.attrs.state === "DONE" },
      [paragraph]
    );
    parent.children.push(node);
    return adf.content?.map((n) => [n, paragraph]);
  },
  taskList: (adf: ADFTaskList, parent) => {
    const node: MDASTList = u("list", { ordered: false, spread: false }, []);
    parent.children.push(node);
    return adf.content.map((n) => [n, node]);
  },
  text: (adf: ADFText, parent) => {
    const { text, marks = [] } = adf;

    const leaf: MDASTLiteral = u("text", adf.text);
    let node = leaf as MDASTContent;

    marks.forEach((mark) => {
      const { type, attrs } = mark;

      if (type === "code") {
        leaf.type = "inlineCode";
      } else {
        if (type === "em") {
          node = u("emphasis", [node]) as MDASTEmphasis;
        } else if (type === "strong") {
          node = u("strong", [node]) as MDASTStrong;
        } else if (type === "strike") {
          node = u("delete", [node]) as MDASTDelete;
        } else if (type === "link") {
          node = u("link", { url: attrs.href }, [node]) as MDASTLink;
        } else if (type === "subsup") {
          node = u("html", `<${attrs.type}>${text}</${attrs.type}>`);
        }
      }
    });

    parent.children.push(node);
  },
};

class AssertionError extends Error {}

function assert(value: unknown, message = ""): asserts value {
  if (!value) throw new AssertionError(message);
}

export default function convert(doc: ADFDoc): MDASTRoot {
  assert(doc.version === 1, `unknown document version ${doc.version}`);

  const tree: MDASTRoot = u("root", []);
  const stack: Stack = [doc.content.map((adf) => [adf, tree])];

  while (stack.length > 0) {
    const index = stack.length - 1;
    const queue = stack[index];

    if (queue.length === 0) {
      stack.pop();
      continue;
    }

    const [adf, parent] = queue.shift()!;

    const map = mappings[adf.type];
    assert(map, `unsupported node type "${adf.type}"`);

    const entry = map(adf, parent);

    if (entry) stack.push(entry);
  }

  return tree;
}
