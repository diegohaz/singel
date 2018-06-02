#!/usr/bin/env node
import { join } from "path";
import meow from "meow";
import { JSDOM } from "jsdom";
import testComponent from ".";

const { window } = new JSDOM("<!doctype html><html><body></body></html>");
global.window = window;
global.document = window.document;

const cli = meow(`
  Usage
    $ sep [path]

  Examples
    $ sep src/elements/**
`);

const run = paths => {
  require("babel-register")({ plugins: ["transform-es2015-modules-commonjs"] });
  paths.forEach(path => {
    const { default: Component } = require(join("..", path));
    testComponent(Component);
  });
};

run(cli.input);
