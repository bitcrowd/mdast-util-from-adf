import fs from "fs/promises";
import path from "path";
import stringify from "remark-stringify";
import { unified } from "unified";

import { parse, transform } from ".";

function read(filepath: string): Promise<string> {
  return fs.readFile(filepath, { encoding: "utf8" });
}

describe("rejira", () => {
  let example: string;

  async function process(input: string): Promise<string> {
    const pipeline = unified()
      .use(parse)
      .use(transform)
      .use(stringify)
      .freeze();

    const file = await pipeline.process(input);

    return String(file);
  }

  beforeAll(async () => {
    example = await read(path.join(__dirname, "example.txt"));
  });

  it("works", async () => {
    expect(await process(example)).toMatchInlineSnapshot(`
      "## Hello, *World*!
      "
    `);
  });
});
