#!/usr/bin/env node
import { join, isAbsolute } from "path";
import meow from "meow";
import { JSDOM } from "jsdom";
import { upperCase, startCase } from "lodash";
import testComponent from ".";
import chalk from "chalk";

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
  let result;

  paths.forEach(path => {
    const p = isAbsolute(path) ? path : join(process.cwd(), path);
    const { default: Component } = require(p);
    result = testComponent(Component);
  });
  return result;
};

const print = result => {
  Object.keys(result).forEach(errorCategory => {
    const prettyCategory = upperCase(errorCategory);
    console.group(
      "\n",
      "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ",
      "\n",
      `***    ${prettyCategory}    ***`,
      "\n",
      "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ "
    );

    Object.keys(result[errorCategory]).forEach(errorType => {
      const prettyType = startCase(errorType);
      console.group("\n", `*  ${prettyType}  *`, "\n");
      console.group();

      if (result[errorCategory][errorType].length) {
        result[errorCategory][errorType].forEach(error => console.log(error));
      } else {
        console.log(`✔︎ None`);
      }

      console.groupEnd("\n");
      console.groupEnd();
    });
    console.groupEnd("\n\n");
  });
  console.log("\n\n");
};

print(run(cli.input));
