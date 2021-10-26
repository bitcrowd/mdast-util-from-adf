import type {
  DocNode as ADFDoc,
  PanelType as ADFPanelType,
} from "@atlaskit/adf-schema";
import { u } from "unist-builder";

import convert from ".";

function doc(content: ADFDoc["content"]): ADFDoc {
  return { version: 1, type: "doc", content };
}

it("converts empty documents", () => {
  expect(convert(doc([]))).toEqual(u("root", []));
});

it("converts simple documents", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Hello " },
            { type: "text", text: "World", marks: [{ type: "strong" }] },
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

(
  [
    ["strong text", "strong", "strong"],
    ["emphasized text", "em", "emphasis"],
    ["strikethrough text", "strike", "delete"],
  ] as const
).forEach(([description, mark, type]) => {
  it(`converts ${description}`, () => {
    expect(
      convert(
        doc([
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is " },
              { type: "text", text: description, marks: [{ type: mark }] },
            ],
          },
        ])
      )
    ).toEqual(
      u("root", [
        u("paragraph", [
          u("text", "This is "),
          u(type, [u("text", description)]),
        ]),
      ])
    );
  });
});

it("converts strong emphasized text", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            {
              type: "text",
              text: "strong & emphasized",
              marks: [{ type: "em" }, { type: "strong" }],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u("paragraph", [
        u("text", "This is "),
        u("strong", [u("emphasis", [u("text", "strong & emphasized")])]),
      ]),
    ])
  );
});

it("converts inline code", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            {
              type: "text",
              text: "code",
              marks: [{ type: "code" }],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u("paragraph", [u("text", "This is "), u("inlineCode", "code")]),
    ])
  );
});

(
  [
    ["subscript text", "sub"],
    ["superscript text", "sup"],
  ] as const
).forEach(([description, type]) => {
  it(`converts ${description}`, () => {
    expect(
      convert(
        doc([
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "x",
              },
              {
                type: "text",
                text: "2",
                marks: [{ type: "subsup", attrs: { type } }],
              },
            ],
          },
        ])
      )
    ).toEqual(
      u("root", [
        u("paragraph", [u("text", "x"), u("html", `<${type}>2</${type}>`)]),
      ])
    );
  });
});

it("converts links", () => {
  const url = "https://github.com/bitcrowd/mdast-util-from-adf";

  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "GitHub",
              marks: [{ type: "link", attrs: { href: url } }],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [u("paragraph", [u("link", { url }, [u("text", "GitHub")])])])
  );
});

[1, 2, 3, 4, 5, 6].forEach((level) => {
  it(`converts headings (${level})`, () => {
    expect(
      convert(
        doc([
          {
            type: "heading",
            attrs: { level },
            content: [{ type: "text", text: "Heading" }],
          },
        ])
      )
    ).toEqual(
      u("root", [u("heading", { depth: level }, [u("text", "Heading")])])
    );
  });
});

it("converts code blocks", () => {
  expect(
    convert(
      doc([
        {
          type: "codeBlock",
          attrs: {
            language: "typescript",
          },
          content: [
            {
              type: "text",
              text: 'import { fromADF } from "mdast-util-from-adf";',
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u(
        "code",
        { lang: "typescript" },
        'import { fromADF } from "mdast-util-from-adf";'
      ),
    ])
  );
});

(
  [
    ["lists (bullet)", "bulletList", false],
    ["lists (ordered)", "orderedList", true],
  ] as const
).forEach(([description, type, ordered]) => {
  it(`converts ${description}`, () => {
    expect(
      convert(
        doc([
          {
            type,
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "one" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "two" }],
                  },
                ],
              },
            ],
          },
        ])
      )
    ).toEqual(
      u("root", [
        u("list", { ordered, spread: false }, [
          u("listItem", { spread: false }, [
            u("paragraph", [u("text", "one")]),
          ]),
          u("listItem", { spread: false }, [
            u("paragraph", [u("text", "two")]),
          ]),
        ]),
      ])
    );
  });
});

it("converts lists (task)", () => {
  expect(
    convert(
      doc([
        {
          type: "taskList",
          attrs: {
            localId: "11244654-2201-4973-b974-522b697d2327",
          },
          content: [
            {
              type: "taskItem",
              attrs: {
                localId: "8acdda43-05dd-4eb0-881d-33e7c59c699f",
                state: "DONE",
              },
              content: [{ type: "text", text: "Completed" }],
            },
            {
              type: "taskItem",
              attrs: {
                localId: "89571672-56da-406b-a8b8-6c9156556167",
                state: "TODO",
              },
              content: [{ type: "text", text: "To be done" }],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u("list", { ordered: false, spread: false }, [
        u("listItem", { checked: true, spread: false }, [
          u("paragraph", [u("text", "Completed")]),
        ]),
        u("listItem", { checked: false, spread: false }, [
          u("paragraph", [u("text", "To be done")]),
        ]),
      ]),
    ])
  );
});

it("converts lists (decision)", () => {
  expect(
    convert(
      doc([
        {
          type: "decisionList",
          attrs: {
            localId: "11244654-2201-4973-b974-522b697d2327",
          },
          content: [
            {
              type: "decisionItem",
              attrs: {
                localId: "8acdda43-05dd-4eb0-881d-33e7c59c699f",
                state: "DECIDED",
              },
              content: [{ type: "text", text: "Decided" }],
            },
            {
              type: "decisionItem",
              attrs: {
                localId: "89571672-56da-406b-a8b8-6c9156556167",
                state: "UNDECIDED",
              },
              content: [{ type: "text", text: "Undecided" }],
            },
          ],
        },
      ])
    )
  ).toEqual(
    u("root", [
      u("list", { ordered: false, spread: false }, [
        u("listItem", { checked: true, spread: false }, [
          u("paragraph", [u("text", "Decided")]),
        ]),
        u("listItem", { checked: false, spread: false }, [
          u("paragraph", [u("text", "Undecided")]),
        ]),
      ]),
    ])
  );
});

it("converts block quotes", () => {
  const quote = "I think; therefore I am.";

  expect(
    convert(
      doc([
        {
          type: "blockquote",
          content: [
            { type: "paragraph", content: [{ type: "text", text: quote }] },
          ],
        },
      ])
    )
  ).toEqual(u("root", [u("blockquote", [u("paragraph", [u("text", quote)])])]));
});

it("converts dividers", () => {
  expect(
    convert(
      doc([
        { type: "paragraph", content: [{ type: "text", text: "Before" }] },
        { type: "rule" },
        { type: "paragraph", content: [{ type: "text", text: "After" }] },
      ])
    )
  ).toEqual(
    u("root", [
      u("paragraph", [u("text", "Before")]),
      u("thematicBreak"),
      u("paragraph", [u("text", "After")]),
    ])
  );
});

it("converts emoji", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "emoji",
              attrs: {
                shortName: ":projector:",
                id: "1f4fd",
                text: "📽",
              },
            },
            {
              type: "emoji",
              attrs: {
                shortName: ":boom:",
                id: "0000",
              },
            },
          ],
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", "📽"), u("text", ":boom:")])]));
});

it("converts mentions", () => {
  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [
            {
              type: "mention",
              attrs: {
                id: "557058:aafbc62f-3aa7-444a-8c18-42168d05183d",
                text: "Alison",
                accessLevel: "",
              },
            },
          ],
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", "@Alison")])]));
});

it("converts dates", () => {
  const timestamp = "2021-11-03T12:54:08.354Z";

  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [{ type: "date", attrs: { timestamp } }],
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", timestamp)])]));
});

(
  [
    ["media (single)", "mediaSingle"],
    ["media (group)", "mediaGroup"],
  ] as const
).forEach(([description, type]) => {
  it(`converts ${description}`, () => {
    expect(
      convert(
        doc([
          {
            type,
            attrs: { layout: "center" },
            content: [
              {
                type: "media",
                attrs: {
                  id: "4b3fc7ea-3a65-4dda-8ae4-0c0576a6b9d3",
                  type: "file",
                  collection: "",
                  width: 1632,
                  height: 1372,
                },
              },
            ],
          },
        ])
      )
    ).toEqual(
      u("root", [
        u("html", "<!-- media: file 4b3fc7ea-3a65-4dda-8ae4-0c0576a6b9d3 -->"),
      ])
    );
  });
});

it("converts cards (block)", () => {
  const url = "https://github.com/bitcrowd/mdast-util-from-adf";

  expect(
    convert(
      doc([
        {
          type: "blockCard",
          attrs: {
            url,
          },
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", url)])]));
});

it("converts cards (inline)", () => {
  const url = "https://github.com/bitcrowd/mdast-util-from-adf";

  expect(
    convert(
      doc([
        {
          type: "paragraph",
          content: [{ type: "inlineCard", attrs: { url } }],
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", url)])]));
});

it("converts cards (embed)", () => {
  const url = "https://github.com/bitcrowd/mdast-util-from-adf";

  expect(
    convert(
      doc([
        {
          type: "embedCard",
          attrs: { layout: "center", url },
        },
      ])
    )
  ).toEqual(u("root", [u("link", { url }, [u("text", url)])]));
});

(["info", "note", "success", "warning", "error"] as ADFPanelType[]).forEach(
  (type) => {
    it(`converts panels (${type})`, () => {
      expect(
        convert(
          doc([
            {
              type: "panel",
              attrs: { panelType: type },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Some panel text" }],
                },
              ],
            },
          ])
        )
      ).toEqual(u("root", [u("paragraph", [u("text", "Some panel text")])]));
    });
  }
);

it("converts layout containers", () => {
  expect(
    convert(
      doc([
        {
          type: "layoutSection",
          content: [
            {
              type: "layoutColumn",
              attrs: { width: 100 },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Content" }],
                },
              ],
            },
          ],
        },
      ])
    )
  ).toEqual(u("root", [u("paragraph", [u("text", "Content")])]));
});
