import clsx from "clsx";
import { type ReactNode, useState } from "react";

export type Tab = { label: string; content: ReactNode };
export type Props<K extends string> = {
  tabs: Record<K, Tab>;
  labelledby: string;
};

function Tabs<K extends string>({ tabs, labelledby }: Props<K>) {
  const keys = Object.keys(tabs) as K[];
  const firstKey = keys[0];
  const [active, setActive] = useState<K>(keys[0]);

  return (
    <>
      <div role="tablist" aria-labellecby={labelledby} className="flex gap-2">
        {keys.map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={key === active}
            className={clsx(
              "border px-4 py-1.5 text-sm",
              key === active
                ? "rounded-t border-gray-300 border-b-white"
                : "border-transparent",
            )}
            onClick={() => setActive(key)}
          >
            {tabs[key].label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        className={clsx(
          "-mt-px rounded-tr rounded-b border border-gray-300 p-2",
          active == firstKey ? "" : "rounded-tl",
        )}
      >
        {tabs[active].content}
      </div>
    </>
  );
}

export default Tabs;
