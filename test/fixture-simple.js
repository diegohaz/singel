import React from "react";

// eslint-disable-next-line
const simpleFixture = ({ children, style, ...props }) => (
  <div {...props}>{children}</div>
);

export default simpleFixture;
