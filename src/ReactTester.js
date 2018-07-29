// @flow
import React from "react";
import type { ComponentType } from "react";
import { omit } from "lodash";
import { configure, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { JSDOM } from "jsdom";
import EventEmitter from "events";
import {
  findHTMLTags,
  getHTMLTag,
  findHTMLTag,
  isVoidElement,
  getReactProps,
  getMissingClassName,
  getStyleProps,
  getReactEventHandlers,
  getEventName
} from "./utils";

configure({ adapter: new Adapter() });

const { window } = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true
});

global.window = window;

Object.keys(window).forEach(key => {
  if (typeof global[key] === "undefined") {
    global[key] = window[key];
  }
});

class Tester extends EventEmitter {
  element: ComponentType<any>;

  constructor(Element: ComponentType<any>) {
    super();
    this.element = Element;
  }

  mount(props?: Object): Object {
    return mount(React.createElement(this.element, props));
  }

  run() {
    let shouldStop = false;
    let failed = false;

    this.once("break", () => {
      shouldStop = true;
    });

    this.once("error", () => {
      failed = true;
    });

    const tests = [
      this.testBreak,
      this.testOneElement,
      this.testChildren,
      this.testHTMLProps,
      this.testClassName,
      this.testStyle,
      this.testInternalStyle,
      this.testEventHandlers
    ];

    this.emit("start");
    tests.forEach(test => shouldStop || test());
    this.emit("end", failed);
  }

  testBreak = () => {
    try {
      this.mount();
    } catch (e) {
      this.emit("error", `Don't break: ${e.message}`);
      this.emit("break");
    }
  };

  testOneElement = () => {
    const wrapper = this.mount();
    const tags = findHTMLTags(wrapper);
    const tagsString = tags.map(t => t.type()).join(" > ");
    if (tags.length > 1) {
      this.emit("error", `Render only one element: ${tagsString}`);
    }
  };

  testChildren = () => {
    const wrapper = this.mount();
    if (!getHTMLTag(wrapper)) return;
    if (!isVoidElement(wrapper)) {
      wrapper.setProps({ children: "children" });
      if (!wrapper.contains("children")) {
        this.emit("error", "Render children passed as prop.");
      }
    }
  };

  testHTMLProps = () => {
    const originalWrapper = this.mount();
    if (!getHTMLTag(originalWrapper)) return;
    const type = findHTMLTag(originalWrapper).type();
    const reactProps = getReactProps(type);
    const wrapper = this.mount(reactProps);
    const props = findHTMLTag(wrapper).props();

    Object.keys(reactProps).forEach(prop => {
      if (!props[prop]) {
        this.emit("error", `Render HTML attributes passed as props: ${prop}`);
      } else if (props[prop] !== reactProps[prop]) {
        this.emit(
          "error",
          `Override internal HTML attributes with props: ${prop}`
        );
      }
    });
  };

  testClassName = () => {
    const originalWrapper = this.mount();
    if (!getHTMLTag(originalWrapper)) return;

    const originalClassName = findHTMLTag(originalWrapper).prop("className");

    const className = "foobarbaz";
    const wrapper = this.mount({ className });
    const renderedClassName = findHTMLTag(wrapper).prop("className") || "";
    const renderedClassNames = renderedClassName.split(" ");

    if (!renderedClassNames.includes(className)) {
      this.emit("error", "Render className passed as prop.");
    }

    const missingClassName = getMissingClassName(
      originalClassName,
      renderedClassName
    );

    if (missingClassName) {
      this.emit(
        "error",
        `Don't override internal className: ${missingClassName}`
      );
    }
  };

  testStyle = () => {
    const style = getStyleProps();
    const wrapper = this.mount({ style });
    if (!getHTMLTag(wrapper)) return;

    const renderedStyle = findHTMLTag(wrapper).prop("style") || {};

    Object.keys(style).forEach(prop => {
      if (typeof renderedStyle[prop] === "undefined") {
        this.emit("error", `Render style passed as prop: ${prop}`);
      } else if (renderedStyle[prop] !== style[prop]) {
        this.emit("error", `Override internal style prop with props: ${prop}`);
      }
    });
  };

  testInternalStyle = () => {
    const originalWrapper = this.mount();
    if (!getHTMLTag(originalWrapper)) return;

    const originalStyle = findHTMLTag(originalWrapper).prop("style") || {};
    const style = omit(getStyleProps(), Object.keys(originalStyle));
    const wrapper = this.mount({ style });
    const renderedStyle = findHTMLTag(wrapper).prop("style") || {};

    Object.keys(originalStyle).forEach(prop => {
      if (!renderedStyle[prop]) {
        this.emit(
          "error",
          `Don't override the entire internal style with props: ${prop}`
        );
      }
    });
  };

  testEventHandlers = () => {
    const eventHandlers = getReactEventHandlers();
    const wrapper = this.mount(eventHandlers);
    if (!getHTMLTag(wrapper)) return;

    Object.keys(eventHandlers).forEach(prop => {
      const event = eventHandlers[prop];
      try {
        wrapper.simulate(getEventName(prop));
      } catch (e) {
        this.emit("error", `Don't break: ${e.message}`);
      }

      if (!event.called) {
        this.emit("error", `Call event handlers passed as props: ${prop}`);
      } else {
        const [argument] = event.getCall(0).args;
        if (!argument || argument.constructor.name !== "SyntheticEvent") {
          this.emit(
            "error",
            `Pass SyntheticEvent to event handlers passed as props: ${prop}`
          );
        }
      }
    });
  };
}

export default Tester;
