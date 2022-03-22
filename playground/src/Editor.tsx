import {
  Editor,
  EditorContext,
  WithEditorActions,
} from "@atlaskit/editor-core";
import React, { useCallback } from "react";

import example from "./example";

function InternalEditor({ actions, onChange }) {
  const update = useCallback(async () => {
    const value = await actions.getValue();
    onChange(value);
  }, [actions]);

  return (
    <Editor appearance="comment" defaultValue={example} onChange={update} />
  );
}

export type Props = { onChange: (_: any) => void };

function EditorWrapper({ onChange }: Props): React.ReactElement {
  return (
    <EditorContext>
      <WithEditorActions
        render={(actions) => (
          <InternalEditor actions={actions} onChange={onChange} />
        )}
      />
    </EditorContext>
  );
}

export default EditorWrapper;
