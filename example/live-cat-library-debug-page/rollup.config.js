import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
const index = {
  // input: "index.js",
  input: "index-loading.js",
  output: {
    file: "public/index-bundle.js",
    format: "iife",
  },
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    resolve({ browser: true }),
    commonjs(),
  ],
};
const indexPrivate = {
  input: "index-private.js",
  output: {
    file: "public/index-private-bundle.js",
    format: "iife",
  },
  plugins: [
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),
    resolve({ browser: true }),
    commonjs(),
  ],
};
module.exports = [index, indexPrivate];
