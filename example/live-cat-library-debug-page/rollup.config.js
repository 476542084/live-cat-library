import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

const index = {
  input: "index.js",
  output: {
    file: "public/index-bundle.js",
    format: "iife",
  },
  plugins: [resolve(), commonjs()],
};
const indexPrivate = {
  input: "index-private.js",
  output: {
    file: "public/index-private-bundle.js",
    format: "iife",
  },
  plugins: [resolve(), commonjs()],
};
module.exports = [index, indexPrivate];
