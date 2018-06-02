// @flow
import React from "react";
import type { ComponentType } from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { flow, camelCase, omit } from "lodash";
import sinon from "sinon";
import voidElements from "void-elements";
import { all as cssProps } from "known-css-properties";
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
  // test every html prop
  // test every svg prop if the component is svg
  const wrapper = mount(<Element id="foo" />);
  const tag = getHTMLTag(wrapper);
  if (tag && !findHTMLTag(wrapper).find("[id='foo']").length) {
    throw new Error(
      `${Element.displayName || Element.name} should render html props.`
    );
  }
  return Element;
};

const testClassName: TestFn = Element => {
  const originalWrapper = mount(<Element />);
  if (!getHTMLTag(originalWrapper)) return Element;
  const [originalClassName] = (
    findHTMLTag(originalWrapper).prop("className") || ""
  ).split(" ");
  const wrapper = mount(<Element className="bar" />);
  const className = findHTMLTag(wrapper).prop("className");
  const classNames = className.split(" ");

  if (!classNames.includes("bar")) {
    throw new Error(`${Element.name} should render className.`);
  }

  if (originalClassName && !classNames.includes(originalClassName)) {
    throw new Error(
      `${Element.name} should append className, not override it.`
    );
  }

  return Element;
};

const testStyle: TestFn = Element => {
  const originalWrapper = mount(<Element />);
  if (!getHTMLTag(originalWrapper)) return Element;
  const originalStyle = findHTMLTag(originalWrapper).prop("style") || {};

  const wrapper = mount(<Element style={styleProps} />);
  const renderedStyle = findHTMLTag(wrapper).prop("style") || {};

  Object.keys(styleProps).forEach(prop => {
    if (renderedStyle[prop] !== styleProps[prop]) {
      throw new Error(
        `${Element.name} should accept inline style (${prop}) via props.`
      );
    }
  });

  const styleWithoutOriginalKeys = omit(styleProps, Object.keys(originalStyle));
  const thirdWrapper = mount(<Element style={styleWithoutOriginalKeys} />);
  const thirdRenderedStyle = findHTMLTag(thirdWrapper).prop("style") || {};

  Object.keys(originalStyle).forEach(prop => {
    if (!thirdRenderedStyle[prop]) {
      throw new Error(
        `${Element.name} should append inline style via props, not replace it.`
      );
    }
  });

  return Element;
};

const testEventHandlers: TestFn = Element => {
  // test all the event handlers, not only onClick
  // test for event arguments
  const onClick = sinon.fake();
  const wrapper = mount(<Element onClick={onClick} />);
  if (!getHTMLTag(wrapper)) return Element;
  wrapper.simulate("click");
  if (!onClick.called && !wrapper.getDOMNode().disabled) {
    throw new Error(
      `${Element.displayName || Element.name} should accept event handlers.`
    );
  }
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
