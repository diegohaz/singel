#!/usr/bin/env node
import { join, isAbsolute } from "path";
import meow from "meow";
import { JSDOM } from "jsdom";
import { upperCase, startCase } from "lodash";
import chalk from "chalk";
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
  let result;

  paths.forEach(path => {
    const p = isAbsolute(path) ? path : join(process.cwd(), path);
    const { default: Component } = require(p);
    result = testComponent(Component);
  });
  return result;
};

const format = result => {
  const red = chalk.rgb(233, 25, 102);
  const orange = chalk.rgb(233, 105, 52);
  const green = chalk.rgb(103, 213, 2);
  const indent = console.group;
  const outdent = console.groupEnd;
  const print = console.log;

  Object.keys(result).forEach(errorCategory => {
    print("");
    print(chalk.underline(upperCase(errorCategory)));

    Object.keys(result[errorCategory]).forEach(errorType => {
      const errorTypeTitle = startCase(errorType);
      const totalErrors = result[errorCategory][errorType].length;
      const maxErrorsToShow = 5;
      const typeTitleLine = totalErrors
        ? `${errorTypeTitle} (${red(totalErrors)} errors)`
        : errorTypeTitle;
      const errorsToPrint =
        totalErrors > maxErrorsToShow
          ? result[errorCategory][errorType].slice(0, maxErrorsToShow)
          : result[errorCategory][errorType];

      indent();
      indent(typeTitleLine);

      if (totalErrors) {
        errorsToPrint.forEach(error => print(red(`✘ ${error}`)));

        if (errorsToPrint.length !== totalErrors) {
          print(orange(`...and ${totalErrors - maxErrorsToShow} more errors.`));
        }
      } else {
        print(green(`✔︎ None`));
      }

      outdent();
      outdent();
    });
  });
  // outdent();
  print("\n");
};

format(run(cli.input));
