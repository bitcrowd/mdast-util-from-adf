import React from "react";

export type Props = { children: string };

function Code({ children }: Props) {
  return (
    <pre className="max-w-full bg-gray-100 p-2 border rounded text-xs overflow-auto">
      <code>{children}</code>
    </pre>
  );
}

export default Code;
