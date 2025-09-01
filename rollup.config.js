import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "rollup-plugin-dts";

// Enhanced terser configuration for better compression
const terserConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: [
      "console.log",
      "console.warn",
      "console.error",
      "console.info",
      "console.debug",
    ],
    passes: 3,
    unsafe: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    // Additional optimizations
    collapse_vars: true,
    reduce_vars: true,
    hoist_funs: true,
    hoist_vars: true,
    if_return: true,
    join_vars: true,
    sequences: true,
    side_effects: true,
    unused: true,
    dead_code: true,
    evaluate: true,
    booleans_as_integers: true,
    typeofs: true,
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /^_/,
      keep_quoted: true,
    },
    safari10: true,
  },
  format: {
    comments: /^\/\*\*[\s\S]*?\*\//, // Preserve JSDoc comments
    beautify: false, // Always minify for production
    indent_level: 0,
  },
  ecma: 2020,
  module: true,
};

// Enhanced typescript configuration - no declaration generation here since we use dts plugin
const typescriptConfig = {
  tsconfig: "./tsconfig.json",
  declaration: false, // We'll generate declarations separately with dts plugin
  exclude: ["**/*.test.ts", "**/*.spec.ts", "examples/**/*"],
  sourceMap: true, // Enable source maps for better debugging
  inlineSources: false, // Don't inline sources
  // Additional optimizations
  removeComments: true,
  experimentalDecorators: false,
  emitDecoratorMetadata: false,
};

// Enhanced output configuration
const outputConfig = {
  sourcemap: true, // Always include source maps for better debugging
  exports: "named",
  globals: {
    react: "React", // External React dependency
  },
  generatedCode: {
    preset: "es2015",
    constBindings: true,
    objectShorthand: true,
    arrowFunctions: true,
    destructuring: true,
    forOf: true,
    reservedNamesAsProps: false,
  },
  // Better minification
  compact: true,
  // Better tree-shaking
  hoistTransitiveImports: false,
};

// Enhanced plugin configurations with better tree-shaking
const basePlugins = [
  nodeResolve({
    preferBuiltins: true,
    extensions: [".js", ".ts"],
    // Better tree-shaking
    moduleDirectories: ["node_modules"],
  }),
  commonjs({
    include: "node_modules/**",
    transformMixedEsModules: true,
    // Better tree-shaking
    ignoreDynamicRequires: true,
    requireReturnsDefault: "auto",
  }),
  typescript(typescriptConfig),
];

const productionPlugins = [...basePlugins, terser(terserConfig)];

// Aggressive tree-shaking configuration
const treeShakeConfig = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
  // Additional tree-shaking optimizations
  tryCatchDeoptimization: false,
  pureExternalModules: true,
  treeshake: {
    annotations: true,
    correctVarValueBeforeDeclaration: true,
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
    tryCatchDeoptimization: false,
    pureExternalModules: true,
    // Add these for better tree-shaking
    ignoreClassFieldInitialValues: true,
    ignoreFunctionLength: true,
  },
};

export default [
  // Core signals only (lightweight) - ES Module
  {
    input: "src/core-only.ts",
    output: {
      file: "dist/react-understate.signals.js",
      format: "es",
      ...outputConfig,
    },
    plugins: productionPlugins,
    treeshake: treeShakeConfig,
    external: ["react"], // Make React external
    preserveEntrySignatures: "strict",
  },

  // Core signals only (lightweight) - CommonJS
  {
    input: "src/core-only.ts",
    output: {
      file: "dist/react-understate.signals.cjs.js",
      format: "cjs",
      ...outputConfig,
    },
    plugins: productionPlugins,
    treeshake: treeShakeConfig,
    external: ["react"],
    preserveEntrySignatures: "strict",
  },

  // Main library - ES Module (for bundlers)
  {
    input: "src/index.ts",
    output: {
      file: "dist/react-understate.esm.js",
      format: "es",
      ...outputConfig,
    },
    plugins: [
      ...productionPlugins,
      visualizer({
        filename: "bundle-analysis.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
        title: "React Understate Bundle Analysis",
        // Better analysis
        metadata: {
          exclude: ["node_modules"],
        },
      }),
    ],
    external: ["react"],
    treeshake: treeShakeConfig,
    preserveEntrySignatures: "strict",
  },

  // Main library - UMD (for browsers)
  {
    input: "src/index.ts",
    output: {
      file: "dist/react-understate.umd.js",
      format: "umd",
      name: "ReactUnderstate",
      ...outputConfig,
    },
    plugins: productionPlugins,
    external: ["react"],
    treeshake: treeShakeConfig,
    preserveEntrySignatures: "strict",
  },

  // TypeScript declarations bundle
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },

  // Core signals declarations bundle
  {
    input: "src/core-only.ts",
    output: {
      file: "dist/core.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
