import { u } from "unist-builder";

import convert from ".";

it("converts empty document", () => {
  expect(
    convert({
      version: 1,
      type: "doc",
      content: [],
    })
  ).toEqual(u("root", []));
});

it("converts simple document", () => {
  expect(
    convert({
      version: 1,
      type: "doc",
      content: [
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
      ],
    })
  ).toEqual(
    u("root", [
      u("paragraph", [u("text", "Hello "), u("strong", [u("text", "World")])]),
    ])
  );
});
