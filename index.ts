import type { Root as MdastRoot } from "mdast";
import type { Plugin } from "unified";

type Root = MdastRoot; // TODO: extends with Jira node types

// Parser

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
export function parser(doc: string): Root {
  const mock = {
    type: "root",
    children: [
      {
        type: "heading",
        depth: 2,
        children: [
          { type: "text", value: "Hello, " },
          {
            type: "emphasis",
            children: [{ type: "text", value: "World" }],
          },
          { type: "text", value: "!" },
        ],
      },
    ],
  } as Root;

  return mock;
}

// Transform from Jira to Markdown AST

export function transform(node: Root): MdastRoot {
  return node as MdastRoot; // TODO: properly convert node to MdastRoot
}

// Plugins

export const parse: Plugin<void[], string, Root> = function parse() {
  Object.assign(this, { Parser: parser });
};

export const remark: Plugin<void[], Root, MdastRoot> = function remark() {
  return transform;
};
