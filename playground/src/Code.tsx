export type Props = { children: string };

function Code({ children }: Props) {
  return (
    <pre className="max-w-full overflow-auto rounded border bg-gray-100 p-2 text-xs">
      <code>{children}</code>
    </pre>
  );
}

export default Code;
