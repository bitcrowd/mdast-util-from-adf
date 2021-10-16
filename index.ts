import type { DocNode as AdfRoot } from "@atlaskit/adf-schema";
import type { Root as MdastRoot } from "mdast";

export default function convert(node: AdfRoot): MdastRoot {
  // TODO: Convert node to `MdastRoot`.
  //
  // Check `unist` utilities for tree traversal and transformation:
  // https://github.com/syntax-tree/unist
  return { type: "root", children: [] };
}
