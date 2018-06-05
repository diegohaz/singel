import React from "react";
import { camelCase } from "lodash";
import testComponent from "../src/testComponent";

// eslint-disable-next-line no-console
console.error = jest.fn();

expect.extend({
  noErrorsInCategory(output, argument) {
    const errCategory = `${camelCase(argument)}Test`;
    const errTypes = Object.keys(output[errCategory]);
    const fail = errTypes.filter(t => output[errCategory][t].length !== 0);

    if (fail.length) {
      return {
        message: () =>
          `Error messages: ${Object.values(output[errCategory]).join()}`,
        pass: false
      };
    }
    return {
      message: () => "",
      pass: true
    };
  }
});

describe("break", () => {
  test("good", () => {
    const Element = ({ getId, ...props }) => {
      const id = getId ? getId() : "id";
      return <div id={id} {...props} />;
    };
    expect(testComponent(Element)).noErrorsInCategory("break");
  });

  test("bad", () => {
    const Element = ({ getId, ...props }) => <div id={getId()} {...props} />;
    expect(() => testComponent(Element)).toThrow();
  });
});

describe("single element", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("single element");
  });

  test("good - component renders null", () => {
    const Element = () => null;
    expect(testComponent(Element)).noErrorsInCategory("single element");
  });

  test("good - composing", () => {
    const Element = props => <div {...props} />;
    const Element2 = props => <Element {...props} />;
    expect(testComponent(Element2)).noErrorsInCategory("single element");
  });

  test("bad", () => {
    const Element = props => (
      <div {...props}>
        <span />
      </div>
    );
    expect(testComponent(Element)).not.noErrorsInCategory("single element");
  });
});

describe("children", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("children");
  });

  test("good - void element", () => {
    const Element = ({ children, ...props }) => <img {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("children");
  });

  test("bad", () => {
    const Element = ({ children, ...props }) => <div {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("children");
  });
});

describe("html props", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("html props");
  });

  test("bad", () => {
    const Element = ({ children }) => <div>{children}</div>;
    expect(testComponent(Element)).not.noErrorsInCategory("html props");
  });
});

describe("className", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("className");
  });

  test("good - appending className", () => {
    const Element = ({ className, ...props }) => (
      <div className={`foo ${className}`} {...props} />
    );
    expect(testComponent(Element)).noErrorsInCategory("className");
  });

  test("bad - not rendering className", () => {
    const Element = ({ className, ...props }) => <div {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("className");
  });

  test("bad - replacing instead of appending", () => {
    const Element = props => <div className="foo" {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("className");
  });
});

describe("style props", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("style props");
  });

  test("good - appending style", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ padding: 10, ...style }} {...props} />
    );
    expect(testComponent(Element)).noErrorsInCategory("style props");
  });

  test("bad - override style props", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ ...style, padding: 10 }} {...props} />
    );
    expect(testComponent(Element)).not.noErrorsInCategory("style props");
  });

  test("bad - not rendering style", () => {
    const Element = ({ style, ...props }) => <div {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("style props");
  });

  test("bad - replacing instead of appending", () => {
    const Element = props => <div style={{ padding: 10 }} {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("style props");
  });
});

describe("event handlers", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("event handlers");
  });

  test("good - replacing original onClick", () => {
    const Element = props => <div onClick={jest.fn} {...props} />;
    expect(testComponent(Element)).noErrorsInCategory("event handlers");
  });

  test("good - composing event handler", () => {
    const callAll = (...fns) => (...args) =>
      fns.forEach(fn => fn && fn(...args));

    const Element = ({ onClick, ...props }) => (
      <div onClick={callAll(jest.fn, onClick)} {...props} />
    );
    expect(testComponent(Element)).noErrorsInCategory("event handlers");
  });

  test("bad - not passing onClick", () => {
    const Element = ({ onClick, ...props }) => <div {...props} />;
    expect(testComponent(Element)).not.noErrorsInCategory("event handlers");
  });

  test("bad - not passing args to onClick", () => {
    const Element = ({ onClick, ...props }) => (
      <div onClick={() => onClick()} {...props} />
    );
    expect(testComponent(Element)).not.noErrorsInCategory("event handlers");
  });

  test("bad - replacing onClick prop", () => {
    const Element = props => <div {...props} onClick={jest.fn} />;
    expect(testComponent(Element)).not.noErrorsInCategory("event handlers");
  });
});
