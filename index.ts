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
  HardBreakDefinition as ADFHardBreak,
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
} from "@atlaskit/adf-schema/schema";
import type {
  Content as MDASTContent,
  Delete as MDASTDelete,
  Emphasis as MDASTEmphasis,
  Link as MDASTLink,
  ListItem as MDASTListItem,
  Literal as MDASTLiteral,
  Paragraph as MDASTParagraph,
  Parent as MDASTParent,
  Root as MDASTRoot,
  Strong as MDASTStrong,
} from "mdast";
import { u } from "unist-builder";

type ADFNode =
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
  | ADFHardBreak
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
type ADFParent = Extract<ADFNode, { content?: Array<ADFNode> }>;

type StackEntry<MDASTNode extends MDASTParent> = [ADFNode, MDASTNode][];
type Stack = [StackEntry<MDASTRoot>, ...StackEntry<MDASTParent>[]];

type Proc<ADF> = (_: ADF, __: MDASTParent) => StackEntry<MDASTParent> | void;

// Create a new stack entry for the content of an ADF node, if present.
function enter<ADF extends { content?: ADFNode[] }>(
  adf: ADF,
  parent: MDASTParent
): StackEntry<MDASTParent> | void {
  return adf.content?.map((n) => [n, parent]);
}

// Expand an ADF node into a (linear) MDAST subtree (root-...-leaf).
// Attach the root of this tree to the parent node and continue
// processing of ADF content with the leaf as the new parent.
function expand<ADF extends ADFParent>(
  transform: (_: ADF) => {
    root: Extract<MDASTContent, MDASTParent>;
    leaf: Extract<MDASTContent, MDASTParent>;
  }
): Proc<ADF> {
  return (adf: ADF, parent: MDASTParent) => {
    const tree = transform(adf);
    parent.children.push(tree.root);
    return enter(adf, tree.leaf);
  };
}

// Produce an MDAST counterpart for this ADF node.
// Continue processing branches in the ADF tree.
function map<ADF extends ADFParent>(
  transform: (_: ADF) => Extract<MDASTContent, MDASTParent>
): Proc<ADF> {
  return (adf: ADF, parent: MDASTParent) => {
    const node = transform(adf);
    parent.children.push(node);
    return enter(adf, node);
  };
}

// Produce an MDAST counterpart for this ADF node.
// Stop processing on this branch of the ADF tree.
function put<ADF>(transform: (_: ADF) => MDASTContent): Proc<ADF> {
  return (adf: ADF, parent: MDASTParent) => {
    parent.children.push(transform(adf));
  };
}

// Do not produce an MDAST counterpart for this ADF node.
// Instead, continue with processing its content.
function skip<ADF extends ADFParent>(
  adf: ADF,
  parent: MDASTParent
): StackEntry<MDASTParent> | void {
  return enter(adf, parent);
}

const handlers: Record<ADFType, Proc<any> | undefined> = {
  blockCard: put((adf: ADFBlockCard) => {
    const { attrs } = adf;

    const content =
      "url" in attrs
        ? u("link", { url: attrs.url }, [u("text", attrs.url)])
        : u("html", `<!-- block card: ${JSON.stringify(attrs.data)} -->`);

    return u("paragraph", [content]);
  }),
  blockquote: map(() => u("blockquote", [])),
  bodiedExtension: undefined,
  bulletList: map(() => u("list", { ordered: false, spread: false }, [])),
  codeBlock: put((adf: ADFCodeBlock) => {
    const text = adf.content?.[0]?.text ?? "";
    const lang = adf.attrs?.language;
    return u("code", { lang }, text);
  }),
  date: put((adf: ADFDate) => u("text", adf.attrs.timestamp)),
  decisionItem: expand((adf: ADFDecisionItem) => {
    const content = u("paragraph", []);
    const node = u(
      "listItem",
      { spread: false, checked: adf.attrs.state === "DECIDED" },
      [content]
    );
    return { root: node, leaf: content };
  }),
  decisionList: map(() => u("list", { ordered: false, spread: false }, [])),
  embedCard: put((adf: ADFEmbedCard) => {
    const { url } = adf.attrs;
    return u("link", { url }, [u("text", url)]);
  }),
  emoji: put((adf: ADFEmoji) => {
    const { shortName, text } = adf.attrs;
    return u("text", text ?? shortName);
  }),
  expand: undefined,
  extension: undefined,
  hardBreak: put(() => u("break")),
  heading: map((adf: ADFHeading) => {
    const depth = adf.attrs.level as 1 | 2 | 3 | 4 | 5 | 6;
    return u("heading", { depth }, []);
  }),
  inlineCard: put((adf: ADFInlineCard) => {
    const { attrs } = adf;

    const node =
      "url" in attrs
        ? u("link", { url: attrs.url }, [u("text", attrs.url)])
        : u("html", `<!-- inline card: ${JSON.stringify(attrs.data)} -->`);

    return node;
  }),
  inlineExtension: undefined,
  layoutColumn: skip,
  layoutSection: skip,
  listItem: map(() => u("listItem", { spread: false }, [])),
  media: put((adf: ADFMedia) => {
    const key = "url" in adf.attrs ? adf.attrs.url : adf.attrs.id;
    return u("html", `<!-- media: ${adf.attrs.type} ${key} -->`);
  }),
  mediaGroup: skip,
  mediaInline: undefined,
  mediaSingle: skip,
  mention: put((adf: ADFMention) => u("text", `@${adf.attrs.text}`)),
  nestedExpand: undefined,
  orderedList: map(() => u("list", { ordered: true, spread: false }, [])),
  panel: skip,
  paragraph: map(() => u("paragraph", [])),
  placeholder: undefined,
  rule: put(() => u("thematicBreak")),
  status: undefined,
  table: map(() => u("table", [])),
  tableCell: map(() => u("tableCell", [])),
  tableHeader: map(() => u("tableCell", [])),
  tableRow: map(() => u("tableRow", [])),
  taskItem: expand((adf: ADFTaskItem) => {
    const content: MDASTParagraph = u("paragraph", []);
    const node: MDASTListItem = u(
      "listItem",
      { spread: false, checked: adf.attrs.state === "DONE" },
      [content]
    );
    return { root: node, leaf: content };
  }),
  taskList: map(() => u("list", { ordered: false, spread: false }, [])),
  text: put((adf: ADFText) => {
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

    return node;
  }),
};

class AssertionError extends Error {}

function assert(value: unknown, message = ""): asserts value {
  if (!value) throw new AssertionError(message);
}

function convert(doc: ADFDoc): MDASTRoot {
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

    const proc = handlers[adf.type];
    assert(proc, `unsupported node type "${adf.type}"`);

    const entry = proc(adf, parent);

    if (entry) stack.push(entry);
  }

  return tree;
}

export const fromADF = convert;
