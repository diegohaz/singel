import React from "react";
import Tester from "../src/Tester";

// eslint-disable-next-line no-console
console.error = jest.fn();

const expectError = (element, methodName = "run", not = false) => {
  const listener = jest.fn();
  const tester = new Tester(element);
  tester.on("error", listener);
  tester[methodName]();
  if (not) {
    expect(listener).not.toHaveBeenCalled();
  } else {
    expect(listener).toHaveBeenCalledWith(expect.any(String));
  }
};

const expectNoError = (element, methodName) =>
  expectError(element, methodName, true);

describe("testBreak", () => {
  test("good", () => {
    const Element = ({ getId, ...props }) => {
      const id = getId ? getId() : "id";
      return <div id={id} {...props} />;
    };
    expectNoError(Element);
    expectNoError(Element, "testBreak");
  });

  test("bad", () => {
    const Element = ({ getId, ...props }) => <div id={getId()} {...props} />;
    expectError(Element);
    expectError(Element, "testBreak");
  });
});

describe("testOneElement", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testOneElement");
  });

  test("good - component renders null", () => {
    const Element = () => null;
    expectNoError(Element);
    expectNoError(Element, "testOneElement");
  });

  test("good - composing", () => {
    const Element = props => <div {...props} />;
    const Element2 = props => <Element {...props} />;
    expectNoError(Element2);
    expectNoError(Element2, "testOneElement");
  });

  test("bad", () => {
    const Element = props => (
      <div {...props}>
        <span />
      </div>
    );
    expectError(Element);
    expectError(Element, "testOneElement");
  });
});

describe("testChildren", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testChildren");
  });

  test("good - void element", () => {
    const Element = ({ children, ...props }) => <img {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testChildren");
  });

  test("good - composing", () => {
    const Element = props => <div {...props} />;
    const Element2 = props => <Element {...props} />;
    expectNoError(Element2);
    expectNoError(Element2, "testChildren");
  });

  test("bad", () => {
    const Element = ({ children, ...props }) => <div {...props} />;
    expectError(Element);
    expectError(Element, "testChildren");
  });
});

describe("testHTMLProps", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testHTMLProps");
  });

  test("bad", () => {
    const Element = ({ children }) => <div>{children}</div>;
    expectError(Element);
    expectError(Element, "testHTMLProps");
  });
});

describe("testClassName", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testClassName");
  });

  test("good - appending className", () => {
    const Element = ({ className, ...props }) => (
      <div className={`foo ${className}`} {...props} />
    );
    expectNoError(Element);
    expectNoError(Element, "testClassName");
  });

  test("bad - not rendering className", () => {
    const Element = ({ className, ...props }) => <div {...props} />;
    expectError(Element);
    expectError(Element, "testClassName");
  });

  test("bad - replacing instead of appending", () => {
    const Element = props => <div className="foo" {...props} />;
    expectError(Element);
    expectError(Element, "testClassName");
  });
});

describe("testStyle", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testStyle");
  });

  test("good - appending style", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ padding: 10, ...style }} {...props} />
    );
    expectNoError(Element);
    expectNoError(Element, "testStyle");
  });

  test("bad - override style props", () => {
    const Element = ({ style, ...props }) => (
      <div style={{ ...style, padding: 10 }} {...props} />
    );
    expectError(Element);
    expectError(Element, "testStyle");
  });

  test("bad - not rendering style", () => {
    const Element = ({ style, ...props }) => <div {...props} />;
    expectError(Element);
    expectError(Element, "testStyle");
  });
});

describe("testInternalStyle", () => {
  test("bad - replacing instead of appending", () => {
    const Element = props => <div style={{ padding: 10 }} {...props} />;
    expectError(Element);
    expectError(Element, "testInternalStyle");
  });
});

describe("testEventHandlers", () => {
  test("good", () => {
    const Element = props => <div {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testEventHandlers");
  });

  test("good - replacing original onClick", () => {
    const Element = props => <div onClick={jest.fn} {...props} />;
    expectNoError(Element);
    expectNoError(Element, "testEventHandlers");
  });

  test("good - composing event handler", () => {
    const callAll = (...fns) => (...args) =>
      fns.forEach(fn => fn && fn(...args));

    const Element = ({ onClick, ...props }) => (
      <div onClick={callAll(jest.fn, onClick)} {...props} />
    );
    expectNoError(Element);
    expectNoError(Element, "testEventHandlers");
  });

  test("bad - not passing onClick", () => {
    const Element = ({ onClick, ...props }) => <div {...props} />;
    expectError(Element);
    expectError(Element, "testEventHandlers");
  });

  test("bad - not passing args to onClick", () => {
    const Element = ({ onClick, ...props }) => (
      <div onClick={() => onClick()} {...props} />
    );
    expectError(Element);
    expectError(Element, "testEventHandlers");
  });

  test("bad - replacing onClick prop", () => {
    const Element = props => <div {...props} onClick={jest.fn} />;
    expectError(Element);
    expectError(Element, "testEventHandlers");
  });
});
