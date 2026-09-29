import React from "react";

export type Props = { children: React.ReactNode };

function Heading({ children }: Props): React.ReactElement {
  return <h2 className="font-bold mb-2">{children}</h2>;
}

export default Heading;
