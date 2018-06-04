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

const format = result => {
  const red = chalk.rgb(233, 25, 102);
  const orange = chalk.rgb(233, 105, 52);
  const green = chalk.rgb(103, 213, 2);
  const indent = console.group;
  const outdent = console.groupEnd;
  const print = console.log;

  Object.keys(result).forEach(errorCategory => {
    indent(
      "\n",
      "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ",
      "\n",
      `    ${chalk.underline(upperCase(errorCategory))}    `,
      "\n",
      "~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ "
    );

    Object.keys(result[errorCategory]).forEach(errorType => {
      const prettyType = startCase(errorType);
      const total = result[errorCategory][errorType].length;
      const max = 5;
      const errorsToPrint =
        total > max
          ? result[errorCategory][errorType].slice(0, max)
          : result[errorCategory][errorType];

      indent(
        "\n",
        `${red(total || "")}`,
        `  ${total ? red(prettyType) : prettyType}  `,
        "\n"
      );
      indent();

      if (total) {
        errorsToPrint.forEach(error => print(red(`✘ ${error}`)));

        if (errorsToPrint.length !== total) {
          print(orange(`...and ${total - max} more errors.`));
        }
      } else {
        print(green(`✔︎ None`));
      }

      outdent("\n");
      outdent();
    });
    outdent("\n\n");
  });
  print("\n\n");
};

format(run(cli.input));
