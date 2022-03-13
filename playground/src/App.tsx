import {
  Editor,
  EditorContext,
  WithEditorActions,
} from "@atlaskit/editor-core";
import { toMarkdown } from "mdast-util-to-markdown";
import React, { useCallback, useState } from "react";

import { fromADF } from "../..";

export type Props = {};

const defaultValue = {
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
          text: "ADF",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/",
              },
            },
            {
              type: "strong",
            },
          ],
        },
        {
          type: "text",
          text: "!",
        },
      ],
    },
  ],
};

function EditorWrapper({ actions, onChange }) {
  const update = useCallback(async () => {
    const value = await actions.getValue();
    onChange(value);
  }, [actions]);

  return (
    <Editor
      appearance="comment"
      defaultValue={defaultValue}
      onChange={update}
    />
  );
}

function Code({ children }) {
  return (
    <pre className="text-xs max-w-full overflow-auto p-2 bg-gray-100 border rounded">
      <code>{children}</code>
    </pre>
  );
}

function App(_: Props) {
  const [value, setValue] = useState();
  const [markdown, setMarkdown] = useState<string>();

  const onChange = useCallback(
    (value) => {
      setMarkdown(toMarkdown(fromADF(value)));
      setValue(value);
    },
    [setMarkdown, setValue]
  );

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div>
        <h2>Editor</h2>
        <EditorContext>
          <WithEditorActions
            render={(actions) => (
              <EditorWrapper actions={actions} onChange={onChange} />
            )}
          />
        </EditorContext>
      </div>
      <div>
        <h2>ADF representation</h2>
        <Code>{JSON.stringify(value, null, 2)}</Code>
      </div>
      <div>
        <h2>Markdown</h2>
        <Code>{markdown}</Code>
      </div>
    </div>
  );
}

export default App;
