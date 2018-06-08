import transformES2015ModulesCommonJS from "babel-plugin-transform-es2015-modules-commonjs";
import transformRequireStub from "babel-plugin-transform-require-stub";

const extensions = [
  "css",
  "scss",
  "sass",
  "less",
  "styl",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "md"
];

export default {
  plugins: [
    transformES2015ModulesCommonJS,
    [transformRequireStub, { extensions }]
  ]
};
