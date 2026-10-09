import React, { type ComponentProps } from "react";

export type Props = ComponentProps<"h2">;

function Heading(props: Props): React.ReactElement {
  return <h2 className="mb-2 font-bold" {...props} />;
}

export default Heading;
