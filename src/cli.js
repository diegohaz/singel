#!/usr/bin/env node
import { join, isAbsolute } from "path";
import meow from "meow";
import { JSDOM } from "jsdom";
import testComponent from ".";

const { window } = new JSDOM("<!doctype html><html><body></body></html>");
global.window = window;
global.document = window.document;

const cli = meow(`
  Usage
    $ singel [path]

  Examples
    $ singel src/elements/**
`);

const run = paths => {
  require("babel-register")({ plugins: ["transform-es2015-modules-commonjs"] });

  paths.forEach(path => {
    const p = isAbsolute(path) ? path : join(process.cwd(), path);
    const { default: Component } = require(p);
    const ret = testComponent(Component);
    console.log(Object.keys(ret));
  });
};

run(cli.input);
