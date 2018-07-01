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

  static elementsCount = 0;
  static totalErrorCount = 0;

  static summary() {
    Logger.lineBreak();
    console.log(`${Logger.elementsCount} elements`);
    console.log(
      Logger.totalErrorCount
        ? `${chalk.red(`${Logger.totalErrorCount} errors`)}`
        : `${chalk.green("0 errors")}`
    );
    Logger.lineBreak();
  }

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
    Logger.elementsCount += 1;
  }

  start() {
    const elementName =
      this.element && (this.element.displayName || this.element.name);
    this.loader = ora({
      text: `${chalk.bold(elementName)} ${chalk.gray(
        chalk.underline(this.path)
      )}`,
      stream: process.stdout
    }).start();
  }

  addError(message: string) {
    this.errors.push(`  ${chalk.red(message)}`);
    Logger.totalErrorCount += 1;
  }

  fail(lineBreakAtTop: boolean) {
    // const noop = () => {};
    // this.loader = {};
    // this.loader.clear = noop;
    // this.loader.fail = noop;
    const { loader, errors, options } = this;

    loader.clear();
    if (lineBreakAtTop) Logger.lineBreak();
    loader.fail();
    errors.slice(0, options.maxErrors).forEach(error => console.log(error));

    if (errors.length > options.maxErrors) {
      const remaining = errors.length - options.maxErrors;
      console.log(chalk.yellow(`  ... and ${remaining} more errors.`));
    }
    Logger.lineBreak();
  }

  succeed() {
    // const noop = () => {};
    // this.loader = {};
    // this.loader.succeed = noop;
    this.loader.succeed();
  }
}

export default Logger;
