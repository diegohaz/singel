// @flow
import React from "react";
import type { ComponentType } from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { flow, camelCase, omit } from "lodash";
import sinon from "sinon";
import voidElements from "void-elements";
import { all as cssProps } from "known-css-properties";
import htmlProps from "react-known-props";
import ariaProps from "aria-attributes/index.json";
// $FlowFixMe
import safeHtmlProps from "react-html-attributes";
import { findHTMLTags, getHTMLTag, findHTMLTag } from "./utils";

type TestFn = (Element: ComponentType<any>) => ComponentType<any>;

configure({ adapter: new Adapter() });

const styleProps = cssProps
  .filter(prop => !/^-/.test(prop))
  .map(camelCase)
  .reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: prop
    }),
    {}
  );

const reactProps = [...safeHtmlProps["*"], ...ariaProps]
  .filter(
    prop =>
      !/^style|className|allowTransparency|srcLang|suppressContentEditableWarning|capture|marginWidth|marginHeight|classID|is|keyType|keyParams|charSet|dangerouslySetInnerHTML|on[A-Z].+$/.test(
        prop
      )
  )
  .reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: prop
    }),
    {}
  );

const testErrors: TestFn = Element => {
  try {
    mount(<Element />);
  } catch (e) {
    throw new Error(`${Element.displayName || Element.name} should not break.`);
  }
  return Element;
};

const testSingleElement: TestFn = Element => {
  const wrapper = mount(<Element />);
  const { length } = findHTMLTags(wrapper);
  if (length > 1) {
    throw new Error(
      `${Element.displayName || Element.name} should render only one element.`
    );
  }
  return Element;
};

const testChildren: TestFn = Element => {
  const wrapper = mount(<Element />);
  const isVoidElement = voidElements[getHTMLTag(wrapper)];
  if (!isVoidElement && getHTMLTag(wrapper)) {
    wrapper.setProps({ children: "children" });
    if (!wrapper.contains("children")) {
      throw new Error(
        `${Element.displayName || Element.name} should render its children.`
      );
    }
  }
  return Element;
};

const testHTMLProps: TestFn = Element => {
  const wrapper = mount(<Element {...reactProps} />);
  if (!getHTMLTag(wrapper)) return Element;
  const props = findHTMLTag(wrapper).props();

  const htmlPropErrors = {
    render: []
  };

  Object.keys(reactProps).forEach(prop => {
    if (props[prop] !== reactProps[prop]) {
      htmlPropErrors.render.push(
        `${Element.displayName ||
          Element.name} should render html prop (${prop}).`
      );
    }
  });

  Element.htmlPropErrors = htmlPropErrors;
  return Element;
};

const testClassName: TestFn = Element => {
  const originalWrapper = mount(<Element />);
  if (!getHTMLTag(originalWrapper)) return Element;
  const [originalClassName] = (
    findHTMLTag(originalWrapper).prop("className") || ""
  ).split(" ");
  const wrapper = mount(<Element className="bar" />);
  const className = findHTMLTag(wrapper).prop("className") || "";
  const classNames = className.split(" ");

  const classNameErrors = {
    render: [],
    override: []
  };

  if (!classNames.includes("bar")) {
    classNameErrors.render.push(`${Element.name} should render className.`);
  }

  if (originalClassName && !classNames.includes(originalClassName)) {
    classNameErrors.override.push(
      `${Element.name} should append className, not override it.`
    );
  }

  Element.classNameErrors = classNameErrors;
  return Element;
};

const testStyle: TestFn = Element => {
  const originalWrapper = mount(<Element />);
  if (!getHTMLTag(originalWrapper)) return Element;
  const originalStyle = findHTMLTag(originalWrapper).prop("style") || {};

  const wrapper = mount(<Element style={styleProps} />);
  const renderedStyle = findHTMLTag(wrapper).prop("style") || {};

  const styleErrors = {
    shouldAccept: [],
    shouldAppend: []
  };

  Object.keys(styleProps).forEach(prop => {
    if (renderedStyle[prop] !== styleProps[prop]) {
      styleErrors.shouldAccept.push(
        `${Element.name} should accept inline style (${prop}) via props.`
      );
    }
  });

  const styleWithoutOriginalKeys = omit(styleProps, Object.keys(originalStyle));
  const thirdWrapper = mount(<Element style={styleWithoutOriginalKeys} />);
  const thirdRenderedStyle = findHTMLTag(thirdWrapper).prop("style") || {};

  Object.keys(originalStyle).forEach(prop => {
    if (!thirdRenderedStyle[prop]) {
      styleErrors.shouldAppend.push(
        `${Element.name} should append inline style via props, not replace it.`
      );
    }
  });

  Element.styleErrors = styleErrors;
  return Element;
};

const testEventHandlers: TestFn = Element => {
  const eventHandlers = htmlProps.filter(prop => /^on[A-Z]/.test(prop)).reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: sinon.stub()
    }),
    {}
  );

  const eventHandlerErrors = {
    shouldAccept: [],
    shouldPass: []
  };

  const wrapper = mount(<Element {...eventHandlers} />);
  if (!getHTMLTag(wrapper)) return Element;
  Object.keys(eventHandlers).forEach(prop => {
    const event = prop.replace(/^on/, "");
    const lowercaseEvent = event.charAt(0).toLowerCase() + event.slice(1);
    wrapper.simulate(lowercaseEvent);

    if (!eventHandlers[prop].called) {
      eventHandlerErrors.shouldAccept.push(
        `${Element.displayName ||
          Element.name} should accept event handler (${prop}).`
      );
    }

    const arg =
      eventHandlers[prop].getCall(0) && eventHandlers[prop].getCall(0).args[0];

    if (!arg || arg.constructor.name !== "SyntheticEvent") {
      eventHandlerErrors.shouldPass.push(
        `${Element.displayName ||
          Element.name} should pass SyntheticEvent to ${prop}.`
      );
    }
  });

  Element.eventHandlerErrors = eventHandlerErrors;
  return Element;
};

const testComponent: TestFn = Element =>
  flow(
    testErrors,
    testSingleElement,
    testChildren,
    testHTMLProps,
    testClassName,
    testStyle,
    testEventHandlers
  )(Element);

export default testComponent;
