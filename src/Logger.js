// @flow
/* eslint-disable no-console */
import type { ComponentType } from "react";
import chalk from "chalk";

type Options = {
  maxErrors: number
};

// $FlowFixMe
console.error = () => {};

class Logger {
  element: ComponentType<any>;
  path: string;
  text: string;
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

  static write(text: string = "") {
    return process.stdout.write(`${text}`);
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

    this.text = `${chalk.bold(elementName)} ${chalk.gray(
      chalk.underline(this.path)
    )}`;

    const noop = () => {};
    const repeatString = (s = "", n = 1) => {
      let string = s;

      for (let i = 1; i < n; i += 1) string += s;

      return string;
    };

    this.loader = {};
    this.loader.fail = () => Logger.writeln(`❌ ${chalk.red(this.text)}`);
    this.loader.succeed = () => Logger.writeln(`✔︎ ${chalk.green(this.text)}`);
    this.loader.clear = () =>
      Logger.writeln(repeatString(" ", process.stdout.columns));

    Logger.writeln(this.text);
  }

  addError(message: string) {
    this.errors.push(`  ${chalk.red(message)}`);
    Logger.totalErrorCount += 1;
  }

  fail(lineBreakAtTop: boolean) {
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
