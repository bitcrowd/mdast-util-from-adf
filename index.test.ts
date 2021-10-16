import fs from "fs/promises";
import path from "path";
import stringify from "remark-stringify";
import { unified } from "unified";

import { parse, parser, remark, transform } from ".";

function read(filepath: string): Promise<string> {
  return fs.readFile(filepath, { encoding: "utf8" });
}

let example: string;

beforeAll(async () => {
  example = await read(path.join(__dirname, "example.txt"));
});

describe("parser", () => {
  it("parses jira notation into a syntax tree", () => {
    expect(parser(example)).toMatchInlineSnapshot(`
      Object {
        "children": Array [
          Object {
            "children": Array [
              Object {
                "type": "text",
                "value": "Hello, ",
              },
              Object {
                "children": Array [
                  Object {
                    "type": "text",
                    "value": "World",
                  },
                ],
                "type": "emphasis",
              },
              Object {
                "type": "text",
                "value": "!",
              },
            ],
            "depth": 2,
            "type": "heading",
          },
        ],
        "type": "root",
      }
    `);
  });
});

describe("transform", () => {
  it("transforms a jira syntax tree into a markdown syntax tree", () => {
    expect(transform({ type: "root", children: [] })).toEqual({
      type: "root",
      children: [],
    });
  });
});

describe("end to end", () => {
  async function process(input: string): Promise<string> {
    const pipeline = unified().use(parse).use(remark).use(stringify).freeze();
    const file = await pipeline.process(input);
    return String(file);
  }

  it("works", async () => {
    expect(await process(example)).toMatchInlineSnapshot(`
      "## Hello, *World*!
      "
    `);
  });
});
