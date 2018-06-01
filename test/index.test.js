import sayHello from "../src";

describe("sayHello", () => {
  it("returns hello", () => {
    expect(sayHello()).toBe("Hello, Haz!");
    expect(sayHello("foo")).toBe("Hello, foo!");
  });
});
