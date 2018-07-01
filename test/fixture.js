import React from "react";

// eslint-disable-next-line
const Fixture = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export default Fixture;
