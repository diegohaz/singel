process.env.NODE_ENV = "development";
process.env.BABEL_ENV = "development";

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
  "md",
  "svg"
];

export default {
  presets: [require.resolve("babel-preset-react-app")],
  plugins: [
    require.resolve("babel-plugin-transform-es2015-modules-commonjs"),
    [require.resolve("babel-plugin-transform-require-stub"), { extensions }]
  ]
};
