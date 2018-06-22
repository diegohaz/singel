// @flow
/* eslint-disable no-console */
import type { ComponentType } from "react";
import chalk from "chalk";
import ora from "ora";

type Options = {
  maxErrors: number
};

// $FlowFixMe
console.error = () => {};

class Logger {
  element: ComponentType<any>;
  path: string;
  options: Options;
  loader: Object;
  errors: string[] = [];

  static lineBreak() {
    console.log();
  }

  constructor(
    Element: ComponentType<any>,
    path: string,
    { maxErrors = 10 }: Options = {}
  ) {
    this.element = Element;
    this.path = path;
    this.options = { maxErrors };
  }

  start() {
    const elementName = this.element.displayName || this.element.name;
    this.loader = ora(
      `${chalk.bold(elementName)} ${chalk.gray(chalk.underline(this.path))}`
    ).start();
  }

  addError(message: string) {
    this.errors.push(`  ${chalk.red(message)}`);
  }

  fail(lineBreakAtTop: boolean) {
    const { loader, errors, options } = this;

    loader.clear();
    if (lineBreakAtTop) Logger.lineBreak();
    loader.fail();
    errors.slice(0, options.maxErrors).forEach(error => console.log(error));

    if (errors.length > options.maxErrors) {
      const remaining = errors.length - options.maxErrors;
      console.log(chalk.yellow(`  ... and ${remaining} more errors.`));
    }
    console.log(chalk.green(`${errors.length} errors`));
    Logger.lineBreak();
  }

  succeed() {
    this.loader.succeed();
  }
}

export default Logger;
