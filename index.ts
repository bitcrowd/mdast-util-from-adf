import type { Root as MdastRoot } from "mdast";
import type { Plugin } from "unified";
import type { Node } from "unist";

type Root = Node; // TODO: define Jira node types

export const parse: Plugin<void[], string, Root> = function parse() {
  function parser(/* doc: string */): Root {
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
    };

    return mock;
  }

  Object.assign(this, { Parser: parser });
};

export const transform: Plugin<void[], Root, MdastRoot> = function transform() {
  return (node) => {
    return node as MdastRoot; // TODO: properly convert node to MdastRoot
  };
};
