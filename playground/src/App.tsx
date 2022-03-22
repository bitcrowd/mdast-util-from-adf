import { toMarkdown } from "mdast-util-to-markdown";
import { gfmToMarkdown } from "mdast-util-gfm";
import React, { useCallback, useState } from "react";

import { fromADF } from "../..";
import Code from "./Code";
import Editor from "./Editor";
import Heading from "./Heading";

function convert(value) {
  return toMarkdown(fromADF(value), { extensions: [gfmToMarkdown()] });
}

export type Props = {};

function App(_: Props) {
  const [value, setValue] = useState();
  const [markdown, setMarkdown] = useState<string>();

  const onChange = useCallback(
    (value) => {
      setMarkdown(convert(value));
      setValue(value);
    },
    [setMarkdown, setValue]
  );

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div>
        <Heading>Editor</Heading>
        <Editor onChange={onChange} />
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
