import type { DocNode } from "@atlaskit/adf-schema";
import { ComposableEditor } from "@atlaskit/editor-core/composable-editor";
import { createDefaultPreset } from "@atlaskit/editor-core/preset-default";
import { usePreset } from "@atlaskit/editor-core/use-preset";
import { contentInsertionPlugin } from "@atlaskit/editor-plugin-content-insertion";
import { emojiPlugin } from "@atlaskit/editor-plugins/emoji";
import { insertBlockPlugin } from "@atlaskit/editor-plugins/insert-block";
import { listPlugin } from "@atlaskit/editor-plugins/list";
import { panelPlugin } from "@atlaskit/editor-plugins/panel";
import { rulePlugin } from "@atlaskit/editor-plugins/rule";
import { tablePlugin } from "@atlaskit/editor-plugins/table";
import { toolbarListsIndentationPlugin } from "@atlaskit/editor-plugins/toolbar-lists-indentation";

export type Props = { value: DocNode; onChange: (doc: DocNode) => void };

function Editor({ value, onChange }: Props) {
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
      .add([
        insertBlockPlugin,
        { horizontalRuleEnabled: true, allowTables: true, allowExpand: true },
      ])
      .add(rulePlugin)
      .add(contentInsertionPlugin)
      .add(tablePlugin)
      .add(emojiPlugin)
      .add(panelPlugin);
  const { preset, editorApi } = usePreset(createPreset);

  return (
    <ComposableEditor
      preset={preset}
      appearance="comment"
      defaultValue={value}
      onChange={() =>
        editorApi?.core.actions.requestDocument((doc) => {
          if (doc) onChange(doc as DocNode);
        })
      }
    />
  );
}

export default Editor;
