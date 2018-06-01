import React from "react";
import testComponent from "../src/testComponent";

describe("a component must render only one element", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = props => (
      <div {...props}>
        <span />
      </div>
    );
    expect(() => testComponent(A)).toThrow();
  });
});

describe("a component must accept children if the underlying html element accepts it", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test.skip("success for a self-closing element", () => {
    const A = ({ children, ...props }) => <img {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = ({ children, ...props }) => <div {...props} />;
    expect(() => testComponent(A)).toThrow();
  });
});

describe("a component must render all html props that are passed to it", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = ({ children }) => <div>{children}</div>;
    expect(() => testComponent(A)).toThrow();
  });
});

describe("a component that has classname internally must accept new classnames via props", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("success appending class name", () => {
    const A = ({ className, ...props }) => (
      <div className={`bar ${className}`} {...props} />
    );
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = ({ className, ...props }) => <div {...props} />;
    expect(() => testComponent(A)).toThrow();
  });
});

describe("a component that implements event handlers internally must accept new event handlers via props", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("success composing event handlers", () => {
    const internalOnClick = onClick => (...args) => {
      // does something
      onClick(...args);
    };
    const A = ({ onClick, ...props }) => (
      <div onClick={internalOnClick(onClick)} {...props} />
    );
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = ({ onClick, ...props }) => <div {...props} />;
    expect(() => testComponent(A)).toThrow();
  });
});

describe("a component that implements inline style internally must accept new style via props", () => {
  test("success", () => {
    const A = props => <div {...props} />;
    expect(testComponent(A)).toBeTruthy();
  });

  test("success composing style", () => {
    const createInternalStyle = style => ({
      margin: 10,
      ...style
    });
    const A = ({ style, ...props }) => (
      <div style={createInternalStyle(style)} {...props} />
    );
    expect(testComponent(A)).toBeTruthy();
  });

  test("failure", () => {
    const A = ({ style, ...props }) => <div {...props} />;
    expect(() => testComponent(A)).toThrow();
  });
});
