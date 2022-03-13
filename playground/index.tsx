import React, { useCallback, useState } from "react";
import { render } from "react-dom";

import { Editor, EditorContext, WithEditorActions } from "@atlaskit/editor-core";

const defaultValue = {
  version: 1,
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Hello " },
        { type: "text", text: "World", marks: [{ type: "strong" }] },
        { type: "text", text: "!" },
      ],
    },
  ],
};

function EditorWrapper({ actions, setValue }) {
  const onChange = useCallback(async () => {
    const value = await actions.getValue();
    // console.log("change", value);
    setValue(value);
  }, [actions]);

  return (
    <Editor
      appearance="comment"
      defaultValue={defaultValue}
      onChange={onChange}
    />
  );
}

function App() {
  const [value, setValue] = useState();

  return (
    <div>
      <div>
        <h2>Editor</h2>
        <EditorContext>
          <WithEditorActions render={(actions) => <EditorWrapper actions={actions} setValue={setValue} />} />
        </EditorContext>
      </div>
      <div>
        <h2>ADF representation</h2>
        <pre>
          <code>
            {JSON.stringify(value, null, 2)}
          </code>
        </pre>
      </div>
      <div>
        <h2>Markdown (TODO)</h2>
      </div>
    </div>
  );
}

const root = document.getElementById("root");
render(<App />, root);
