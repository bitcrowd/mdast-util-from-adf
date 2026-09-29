import type { DocNode } from "@atlaskit/adf-schema";
import { gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import { useMemo, useState } from "react";

import { fromADF } from "../..";
import Code from "./Code";
import Editor from "./Editor";
import Heading from "./Heading";
import example from "./example";

function convert(value: DocNode) {
  return toMarkdown(fromADF(value), { extensions: [gfmToMarkdown()] });
}

export type Props = never;

function App() {
  const [value, setValue] = useState<DocNode>(example);
  const markdown = useMemo(() => convert(value), [value]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div>
        <Heading>Editor</Heading>
        <Editor onChange={setValue} />
      </div>
      <div>
        <Heading>ADF</Heading>
        <Code>{JSON.stringify(value, null, 2)}</Code>
      </div>
      <div>
        <Heading>Markdown</Heading>
        <Code>{markdown}</Code>
      </div>
    </div>
  );
}

export default App;
