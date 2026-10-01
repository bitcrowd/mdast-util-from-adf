import type { DocNode } from "@atlaskit/adf-schema";
import { useState } from "react";

export type Props = { value: DocNode; onChange: (doc: DocNode) => void };

function JsonEditor({ value, onChange }: Props) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string>();

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = event.target.value;
    setText(value);
    try {
      onChange(JSON.parse(value) as DocNode);
      setError(undefined);
    } catch (error) {
      setError((error as Error).message);
    }
  }

  return (
    <>
      <textarea
        className="h-[70vh] w-full rounded border p-2 font-mono text-xs"
        value={text}
        onChange={handleChange}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </>
  );
}

export default JsonEditor;
