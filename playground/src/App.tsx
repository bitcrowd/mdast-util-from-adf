import type { DocNode } from "@atlaskit/adf-schema";
import { gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import { useMemo, useState } from "react";

import { fromADF } from "../..";
import Code from "./Code";
import Editor from "./Editor";
import example from "./example";
import Heading from "./Heading";
import JsonEditor from "./JsonEditor";
import Tabs from "./Tabs";

function convert(value: DocNode) {
  try {
    return toMarkdown(fromADF(value), { extensions: [gfmToMarkdown()] });
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}

export type Props = never;

function App() {
  const [value, setValue] = useState<DocNode>(example);
  const markdown = useMemo(() => convert(value), [value]);

  return (
    <>
      <header className="p-4">
        <h1 className="text-xl font-bold">mdast-util-from-adf Playground</h1>
        <p className="text-sm text-gray-600">
          Convert Atlassian Document Format (ADF) to Markdown (
          <a
            className="text-blue-600 hover:underline"
            href="https://github.com/bitcrowd/mdast-util-from-adf"
          >
            Code on GitHub
          </a>
          ).
        </p>
      </header>
      <main className="grid grid-cols-3 gap-4 p-4">
        <section>
          <Heading id="input-heading">Input</Heading>
          <Tabs
            tabs={{
              rich: {
                label: "Editor",
                content: <Editor value={value} onChange={setValue} />,
              },
              json: {
                label: "Raw ADF",
                content: <JsonEditor value={value} onChange={setValue} />,
              },
            }}
            labelledby="input-heading"
          />
        </section>
        <section>
          <Heading>ADF</Heading>
          <Code>{JSON.stringify(value, null, 2)}</Code>
        </section>
        <section>
          <Heading>Markdown</Heading>
          <Code>{markdown}</Code>
        </section>
      </main>
    </>
  );
}

export default App;
