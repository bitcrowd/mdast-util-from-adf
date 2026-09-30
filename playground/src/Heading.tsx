import React, { type ComponentProps } from "react";

export type Props = ComponentProps<"h2">;

function Heading(props: Props): React.ReactElement {
  return <h2 className="font-bold mb-2" {...props} />;
}

export default Heading;
