import React from "react";
import testComponent from "../src/testComponent";

// eslint-disable-next-line no-console
console.error = jest.fn();

describe("errors", () => {
  test("good", () => {
    const Element = ({ getId, ...props }) => {
      const id = getId ? getId() : "id";
      return <div id={id} {...props} />;
    };
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad", () => {
    const Element = ({ getId, ...props }) => <div id={getId()} {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("single element", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - component renders null", () => {
    const Element = () => null;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - composing", () => {
    const Element = props => <div {...props} />;
    const Element2 = props => <Element {...props} />;
    expect(testComponent(Element2)).toBe(Element2);
  });

  test("bad", () => {
    const Element = props => (
      <div {...props}>
        <span />
      </div>
    );
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("children", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - void element", () => {
    const Element = ({ children, ...props }) => <img {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad", () => {
    const Element = ({ children, ...props }) => <div {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("html props", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad", () => {
    const Element = ({ children }) => <div>{children}</div>;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("className", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - appending className", () => {
    const Element = ({ className, ...props }) => (
      <div className={`foo ${className}`} {...props} />
    );
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad - not rendering className", () => {
    const Element = ({ className, ...props }) => <div {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });

  test("bad - replacing instead of appending", () => {
    const Element = props => <div className="foo" {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("style", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - appending style", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ padding: 10, ...style }} {...props} />
    );
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad - override style props", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ ...style, padding: 10 }} {...props} />
    );
    expect(() => testComponent(Element)).toThrow();
  });

  test("bad - not rendering style", () => {
    const Element = ({ style, ...props }) => <div {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });

  test("bad - replacing instead of appending", () => {
    const Element = props => <div style={{ padding: 10 }} {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("event handlers", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - replacing original onClick", () => {
    const Element = props => <div onClick={jest.fn} {...props} />;
    expect(testComponent(Element)).toBe(Element);
  });

  test("good - composing event handler", () => {
    const callAll = (...fns) => (...args) =>
      fns.forEach(fn => fn && fn(...args));

    const Element = ({ onClick, ...props }) => (
      <div onClick={callAll(jest.fn, onClick)} {...props} />
    );
    expect(testComponent(Element)).toBe(Element);
  });

  test("bad - not passing onClick", () => {
    const Element = ({ onClick, ...props }) => <div {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });

  test("bad - not passing args to onClick", () => {
    const Element = ({ onClick, ...props }) => (
      <div onClick={() => onClick()} {...props} />
    );
    expect(() => testComponent(Element)).toThrow();
  });

  test("bad - replacing onClick prop", () => {
    const Element = props => <div {...props} onClick={jest.fn} />;
    expect(() => testComponent(Element)).toThrow();
  });
});
