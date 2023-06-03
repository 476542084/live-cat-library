import path from "path";
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import strip from "@rollup/plugin-strip";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import image from "@rollup/plugin-image";
import replace from "@rollup/plugin-replace";
import liveCatLiraryPKG from "./package.json";

const MODE_PROD = process.env.NODE_ENV === "production";
const LIBRARY_NAME = "LiveCatLibrary";

const SOURCE_DIR = `./src`;
const input = `${SOURCE_DIR}/index.ts`;

function createBanner(packageName, version) {
  return `/* ${packageName} v${version} @license MIT */`;
}

const onWarn = (warning, handler) => {
  const { code } = warning;
  const _warning = [
    "a11y-invalid-attribute",
    "css-unused-selector",
    "a11y-label-has-associated-control",
    "unused-export-let",
    "a11y-missing-attribute",
    "a11y-missing-content",
    "a11y-mouse-events-have-key-events",
  ];
  if (_warning.includes(code)) return;

  handler(warning);
};

function liveCatLirary(output) {
  const OUTPUT_DIR = `${output}/live-cat-library`;
  const basePluginList = [
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !MODE_PROD,
      }),
      emitCss: false,
    }),
    image(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.VERSION": JSON.stringify(liveCatLiraryPKG.version),
    }),
    resolve({ browser: true, dedupe: ["svelte"] }),
    commonjs(),
    typescript(),
    ...(MODE_PROD
      ? [
          strip({ include: ["**/*.ts"] }),
          terser({ compress: { drop_console: true } }),
        ]
      : []),
  ];

  /**
   * @type {import('rollup').RollupOptions}
   */
  const modules = {
    onwarn: onWarn,
    input,
    output: [
      {
        file: path.join(OUTPUT_DIR, liveCatLiraryPKG.main),
        format: "cjs",
        banner: createBanner(liveCatLiraryPKG.name, liveCatLiraryPKG.version),
      },
      {
        file: path.join(OUTPUT_DIR, liveCatLiraryPKG.module),
        format: "es",
        banner: createBanner(liveCatLiraryPKG.name, liveCatLiraryPKG.version),
      },
    ],
    // external: [
    //   ...Object.keys(liveCatLiraryPKG.dependencies || {}),
    //   ...Object.keys(liveCatLiraryPKG.peerDependencies || {}),
    // ],
    plugins: [
      ...basePluginList,
      copy({
        targets: [
          { src: `package.json`, dest: OUTPUT_DIR },
          { src: `README.md`, dest: OUTPUT_DIR },
        ],
        verbose: true,
      }),
    ],
  };

  /**
   * @type {import('rollup').RollupOptions}
   */
  const umdModules = {
    onwarn: onWarn,
    input,
    output: {
      file: path.join(OUTPUT_DIR, liveCatLiraryPKG.browser),
      format: "umd",
      name: LIBRARY_NAME,
      banner: createBanner(liveCatLiraryPKG.name, liveCatLiraryPKG.version),
    },
    plugins: [...basePluginList],
  };
  return [modules, umdModules];
}

export default (cliArgs) => {
  const { configDebugPath } = cliArgs;
  const OUTPUT_PATH = MODE_PROD
    ? "build"
    : path.join(
        // configDebugPath || "example/live-cat-library-debug-page",
        configDebugPath || "../3dcat-player-gather",
        "node_modules"
      );
  const builds = [...liveCatLirary(OUTPUT_PATH)] || [];
  return builds;
};
