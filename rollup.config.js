import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const plugins = [commonjs(), nodeResolve()];

export default [
  {
    input: "src/index.js",
    output: {
      file: "dist/bundle.cjs.js",
      format: "cjs",
    },
    plugins,
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/bundle.esm.js",
      format: "esm",
    },
    plugins,
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/bundle.cjs.min.js",
      format: "cjs",
    },
    plugins: plugins.concat(terser()),
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/bundle.esm.min.js",
      format: "esm",
    },
    plugins: plugins.concat(terser()),
  },
];
