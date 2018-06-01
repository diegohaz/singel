// @flow
import React from "react";
import type { ComponentType } from "react";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import flow from "lodash/flow";
import sinon from "sinon";

type TestFn = (Element: ComponentType<any>) => ComponentType<any>;

configure({ adapter: new Adapter() });

const testSingleElement: TestFn = Element => {
  const wrapper = mount(<Element />);
  const { length } = wrapper.children().children();
  if (length) {
    throw new Error(`${Element.name} should render only one element.`);
  }
  return Element;
};

const testChildren: TestFn = Element => {
  // ignore self-closing elements
  const wrapper = mount(<Element>children</Element>);
  if (!wrapper.contains("children")) {
    throw new Error(`${Element.name} should render its children.`);
  }
  return Element;
};

const testHTMLProps: TestFn = Element => {
  // test every html prop
  // test every svg prop if the component is svg
  const wrapper = mount(<Element id="foo" />);
  const { length } = wrapper.children().find("[id='foo']");
  if (!length) {
    throw new Error(`${Element.name} should render html props.`);
  }
  return Element;
};

const testClassName: TestFn = Element => {
  const wrapper = mount(<Element className="foo" />);
  const { length } = wrapper.children().find(".foo");
  if (!length) {
    throw new Error(`${Element.name} should render className.`);
  }
  return Element;
};

const testStyle: TestFn = Element => {
  // test ALL style props
  const wrapper = mount(<Element style={{ padding: 10 }} />);
  const { padding } = wrapper.getDOMNode().style;
  if (padding !== "10px") {
    throw new Error(`${Element.name} should accept inline style via props.`);
  }
  return Element;
};

const testEventHandlers: TestFn = Element => {
  // test all the event handlers, not only onClick
  // test for event arguments
  const onClick = sinon.fake();
  const wrapper = mount(<Element onClick={onClick} />);
  wrapper.simulate("click");
  if (!onClick.called) {
    throw new Error(`${Element.name} should accept event handlers.`);
  }
  return Element;
};

const testComponent: TestFn = Element =>
  flow(
    testSingleElement,
    testChildren,
    testHTMLProps,
    testClassName,
    testStyle,
    testEventHandlers
  )(Element);

export default testComponent;
