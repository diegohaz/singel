#!/usr/bin/env node
import { resolve, relative, isAbsolute } from "path";
import program from "commander";
import glob from "glob";
import ReactTester from "./ReactTester";
import Logger from "./Logger";
import babelConfig from "./babelConfig";
import { version } from "../package.json";

program
  .version(version, "-v, --version")
  .option("-i, --ignore <path>", "Path to ignore")
  .parse(process.argv);

const run = (paths, { ignore }) => {
  Logger.writeln();

  require("babel-register")(babelConfig);

  const realPaths = paths.reduce(
    (acc, path) => [...acc, ...glob.sync(path, { ignore, nodir: true })],
    []
  );

  let hasErrors = false;
  let lastHasError = false;

  const exit = () => {
    Logger.summary(!lastHasError);
    process.exit(hasErrors ? 1 : 0);
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

run(program.args, program);
