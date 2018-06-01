// @flow
import React from "react";
import type { ComponentType } from "react";
import flow from "lodash/flow";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import sinon from "sinon";

configure({ adapter: new Adapter() });

const testSingleElement = (A: ComponentType<any>): ComponentType<any> => {
  const wrapper = mount(<A />);
  const { length } = wrapper.children().children();
  if (length) {
    throw new Error(`${A.name} should render only one element.`);
  }
  return A;
};

const testChildren = (A: ComponentType<any>): ComponentType<any> => {
  // ignore self-closing elements
  const wrapper = mount(<A>children</A>);
  if (!wrapper.contains("children")) {
    throw new Error(`${A.name} should render its children.`);
  }
  return A;
};

const testHTMLProps = (A: ComponentType<any>): ComponentType<any> => {
  // test every html prop
  // test every svg prop if the component is svg
  const wrapper = mount(<A id="foo" />);
  const { length } = wrapper.children().find("[id='foo']");
  if (!length) {
    throw new Error(`${A.name} should render html props.`);
  }
  return A;
};

const testClassName = (A: ComponentType<any>): ComponentType<any> => {
  const wrapper = mount(<A className="foo" />);
  const { length } = wrapper.children().find(".foo");
  if (!length) {
    throw new Error(`${A.name} should render className.`);
  }
  return A;
};

const testEventHandlers = (A: ComponentType<any>): ComponentType<any> => {
  // test all the event handlers, not only onClick
  // test for event arguments
  const onClick = sinon.fake();
  const wrapper = mount(<A onClick={onClick} />);
  wrapper.simulate("click");
  if (!onClick.called) {
    throw new Error(`${A.name} should accept event handlers.`);
  }
  return A;
};

const testStyle = (A: ComponentType<any>): ComponentType<any> => {
  // test ALL style props
  const wrapper = mount(<A style={{ padding: 10 }} />);
  const { padding } = wrapper.getDOMNode().style;
  if (padding !== "10px") {
    throw new Error(`${A.name} should accept inline style via props.`);
  }
  return A;
};

const testComponent = (A: ComponentType<any>): ComponentType<any> =>
  flow(
    testSingleElement,
    testChildren,
    testHTMLProps,
    testClassName,
    testEventHandlers,
    testStyle
  )(A);

export default testComponent;
