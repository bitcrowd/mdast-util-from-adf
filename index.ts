import type { Root as MdastRoot } from "mdast";

type Root = any; // TODO: Define ADF types

export default function convert(doc: Root): MdastRoot {
  // TODO: Convert node to `MdastRoot`.
  //
  // Check `unist` utilities for tree traversal and transformation:
  // https://github.com/syntax-tree/unist
  return { type: "root", children: [] };
}
