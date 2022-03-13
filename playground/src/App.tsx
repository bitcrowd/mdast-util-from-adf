import React, { useCallback, useState } from "react";
import { Editor, EditorContext, WithEditorActions } from "@atlaskit/editor-core";

export type Props = {};

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

function App(_: Props) {
  const [value, setValue] = useState();

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1">
        <h2>Editor</h2>
        <EditorContext>
          <WithEditorActions render={(actions) => <EditorWrapper actions={actions} setValue={setValue} />} />
        </EditorContext>
      </div>
      <div className="flex-1">
        <h2>ADF representation</h2>
        <pre className="text-xs p-2 bg-gray-100 border rounded">
          <code>
            {JSON.stringify(value, null, 2)}
          </code>
        </pre>
      </div>
      <div className="flex-1">
        <h2>Markdown (TODO)</h2>
      </div>
    </div>
  );
}

export default App;
