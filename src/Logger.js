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

  static summary(lineBreakAtTop: boolean) {
    if (lineBreakAtTop) {
      Logger.writeln();
    }
    Logger.writeln(`${Logger.elementsCount} elements`);
    Logger.writeln(
      Logger.totalErrorCount
        ? `${chalk.red(`${Logger.totalErrorCount} errors`)}`
        : `${chalk.green("0 errors")}`
    );
    Logger.writeln();
  }

  static writeln(text: string = "") {
    return process.stdout.write(`${text}\n`);
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

    if (lineBreakAtTop) {
      Logger.writeln();
    }

    loader.enabled = true;
    loader.fail();
    errors.slice(0, options.maxErrors).forEach(error => Logger.writeln(error));

    if (errors.length > options.maxErrors) {
      const remaining = errors.length - options.maxErrors;
      Logger.writeln(chalk.yellow(`  ... and ${remaining} more errors.`));
    }
    Logger.writeln();
  }

  succeed() {
    this.loader.enabled = true;
    this.loader.succeed();
  }
}

export default Logger;
