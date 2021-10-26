import type { DocNode as ADFDoc } from "@atlaskit/adf-schema";
import { u } from "unist-builder";

import convert from ".";

function doc(content: ADFDoc["content"]): ADFDoc {
  return { version: 1, type: "doc", content };
}

it("converts empty document", () => {
  expect(convert(doc([]))).toEqual(u("root", []));
});

it("converts simple document", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello ",
            },
            {
              type: "text",
              text: "World",
              marks: [
                {
                  type: "strong",
                },
              ],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u("paragraph", [u("text", "Hello "), u("strong", [u("text", "World")])]),
    ])
  );
});
