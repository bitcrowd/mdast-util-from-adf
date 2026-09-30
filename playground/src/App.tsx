import type { DocNode } from "@atlaskit/adf-schema";
import { gfmToMarkdown } from "mdast-util-gfm";
import { toMarkdown } from "mdast-util-to-markdown";
import { useMemo, useState } from "react";

import { fromADF } from "../..";
import Code from "./Code";
import Editor from "./Editor";
import JsonEditor from "./JsonEditor";
import Heading from "./Heading";
import example from "./example";

function convert(value: DocNode) {
  try {
    return toMarkdown(fromADF(value), { extensions: [gfmToMarkdown()] });
  } catch (error) {
    return `Error: ${(error as Error).message}`;
  }
}

export type Props = never;
const modes = { rich: "Rich Text", json: "ADF JSON" };
const firstMode = (Object.keys(modes) as Mode[])[0];
type Mode = keyof typeof modes;

function App() {
  const [mode, setMode] = useState<Mode>("rich");
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
          <Heading>Input</Heading>
          <div
            role="tablist"
            aria-label="Input"
            className="flex gap-2"
          >
            {(Object.keys(modes) as Mode[]).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={mode === tab}
                className={`px-4 py-1.5 text-sm border ${mode === tab
                    ? "rounded-t border-gray-300 border-b-white"
                    : "border-transparent"
                  }`}
                onClick={() => setMode(tab)}
              >
                {modes[tab]}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            className={`-mt-px rounded-tr rounded-b border border-gray-300 p-2 ${mode == firstMode ? "" : "rounded-tl"}`}
          >
            {mode === "rich" && <Editor value={value} onChange={setValue} />}
            {mode === "json" && <JsonEditor value={value} onChange={setValue} />}
          </div>
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
