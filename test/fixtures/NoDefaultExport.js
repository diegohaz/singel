import React from "react";

// eslint-disable-next-line
export const NoDefaultExport = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
