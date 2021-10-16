import { u } from "unist-builder";

import convert from ".";

it("converts empty documents", () => {
  expect(convert({ type: "doc", version: 1, content: [] })).toEqual(
    u("root", [])
  );
});
