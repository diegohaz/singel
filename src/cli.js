#!/usr/bin/env node
import { resolve, relative, isAbsolute } from "path";
import glob from "glob";
import ReactTester from "./ReactTester";
import Logger from "./Logger";
import babelConfig from "./babelConfig";

// eslint-disable-next-line no-unused-vars
const [node, singel, ...elements] = process.argv;

if (!elements) {
  process.stdout.write("no paths given \n");
  process.exit(1);
}

const run = paths => {
  Logger.writeln();

  require("babel-register")(babelConfig);

  const realPaths = paths.reduce(
    (acc, path) => [...acc, ...glob.sync(path, { nodir: true })],
    []
  );

  let hasErrors = false;
  let lastHasError = false;

  const exit = () => {
    Logger.summary(!lastHasError);
    if (hasErrors) {
      process.exit(1);
    }
    process.exit(0);
  };

  realPaths.forEach((path, i) => {
    const absolutePath = isAbsolute(path) ? path : resolve(process.cwd(), path);
    const relativePath = relative(process.cwd(), absolutePath);
    const { default: Element } = require(absolutePath);
    const tester = new ReactTester(Element);
    const logger = new Logger(Element, relativePath);

    logger.start();

    tester.on("error", message => {
      hasErrors = true;
      logger.addError(message);
    });

    tester.on("start", message => {
      logger.addError(message);
    });

    tester.on("end", failed => {
      if (failed) {
        logger.fail(i > 0 && !lastHasError);
        lastHasError = true;
      } else {
        logger.succeed();
        lastHasError = false;
      }
    });

    tester.run();
  });

  exit();
};

run(elements);
