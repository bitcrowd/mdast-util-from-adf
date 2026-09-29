import type { DocNode } from "@atlaskit/adf-schema";
import { ComposableEditor } from "@atlaskit/editor-core/composable-editor";
import { usePreset } from "@atlaskit/editor-core/use-preset";
import { createDefaultPreset } from "@atlaskit/editor-core/preset-default";
import { listPlugin } from "@atlaskit/editor-plugins/list";
import { toolbarListsIndentationPlugin } from "@atlaskit/editor-plugins/toolbar-lists-indentation";
import { insertBlockPlugin } from "@atlaskit/editor-plugins/insert-block";

import example from "./example";

export type Props = { onChange: (doc: DocNode) => void };

function Editor({ onChange }: Props) {
  const createPreset = () =>
    createDefaultPreset({ featureFlags: {}, paste: {} })
      .add(listPlugin)
      .add([
        toolbarListsIndentationPlugin,
        {
          allowHeadingAndParagraphIndentation: false,
          showIndentationButtons: true,
        },
      ])
      .add(insertBlockPlugin);
  const { preset, editorApi } = usePreset(createPreset);

  return (
    <ComposableEditor
      preset={preset}
      appearance="comment"
      defaultValue={example}
      onChange={() =>
        editorApi?.core.actions.requestDocument((doc) => {
          if (doc) onChange(doc as DocNode);
        })
      }
    />
  );
}

export default Editor;
