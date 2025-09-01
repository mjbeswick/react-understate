import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'rollup-plugin-dts';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Enhanced terser configuration for better compression
const terserConfig = {
  compress: {
    drop_console: isProduction,
    drop_debugger: isProduction,
    pure_funcs: isProduction ? ['console.log', 'console.warn', 'console.error', 'console.info', 'console.debug'] : [],
    passes: isProduction ? 3 : 1,
    unsafe: isProduction,
    unsafe_comps: isProduction,
    unsafe_Function: isProduction,
    unsafe_math: isProduction,
    unsafe_proto: isProduction,
    unsafe_regexp: isProduction,
    unsafe_undefined: isProduction,
    // Additional optimizations
    collapse_vars: isProduction,
    reduce_vars: isProduction,
    hoist_funs: isProduction,
    hoist_vars: isProduction,
    if_return: isProduction,
    join_vars: isProduction,
    sequences: isProduction,
    side_effects: isProduction,
    unused: isProduction,
    dead_code: isProduction,
    evaluate: isProduction,
    booleans_as_integers: isProduction,
    typeofs: isProduction,
  },
  mangle: {
    toplevel: isProduction,
    properties: isProduction
      ? {
          regex: /^_/,
          keep_quoted: true,
        }
      : false,
    safari10: true,
  },
  format: {
    comments: !isProduction,
    beautify: !isProduction,
    indent_level: !isProduction ? 2 : 0,
  },
  ecma: 2020,
  module: true,
};

// Enhanced typescript configuration - no declaration generation here since we use dts plugin
const typescriptConfig = {
  tsconfig: './tsconfig.json',
  declaration: false, // We'll generate declarations separately with dts plugin
  exclude: ['**/*.test.ts', '**/*.spec.ts', 'examples/**/*'],
  sourceMap: false, // Disable source maps for smaller bundles
  inlineSources: false, // Don't inline sources
  // Additional optimizations
  removeComments: isProduction,
  experimentalDecorators: false,
  emitDecoratorMetadata: false,
};

// Enhanced output configuration
const outputConfig = {
  sourcemap: isDevelopment, // Only include source maps in development
  exports: 'named',
  globals: {
    react: 'React', // External React dependency
  },
  generatedCode: {
    preset: 'es2015',
    constBindings: true,
    objectShorthand: true,
    arrowFunctions: true,
    destructuring: true,
    forOf: true,
    reservedNamesAsProps: false,
  },
  // Better minification
  compact: isProduction,
  // Better tree-shaking
  hoistTransitiveImports: false,
};

// Enhanced plugin configurations with better tree-shaking
const basePlugins = [
  nodeResolve({
    preferBuiltins: true,
    extensions: ['.js', '.ts'],
    // Better tree-shaking
    moduleDirectories: ['node_modules'],
  }),
  commonjs({
    include: 'node_modules/**',
    transformMixedEsModules: true,
    // Better tree-shaking
    ignoreDynamicRequires: true,
    requireReturnsDefault: 'auto',
  }),
  typescript(typescriptConfig),
];

const productionPlugins = [...basePlugins, terser(terserConfig)];

const developmentPlugins = [...basePlugins];

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
    input: 'src/core-only.ts',
    output: {
      file: 'dist/react-understate.signals.js',
      format: 'es',
      ...outputConfig,
    },
    plugins: isProduction ? productionPlugins : developmentPlugins,
    treeshake: treeShakeConfig,
    external: ['react'], // Make React external
    preserveEntrySignatures: 'strict',
  },

  // Core signals only (lightweight) - CommonJS
  {
    input: 'src/core-only.ts',
    output: {
      file: 'dist/react-understate.signals.cjs.js',
      format: 'cjs',
      ...outputConfig,
    },
    plugins: isProduction ? productionPlugins : developmentPlugins,
    treeshake: treeShakeConfig,
    external: ['react'],
    preserveEntrySignatures: 'strict',
  },

  // Main library - ES Module (for bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/react-understate.esm.js',
      format: 'es',
      ...outputConfig,
    },
    plugins: [
      ...(isProduction ? productionPlugins : developmentPlugins),
      visualizer({
        filename: 'bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
        title: 'React Understate Bundle Analysis',
        // Better analysis
        metadata: {
          exclude: ['node_modules'],
        },
      }),
    ],
    external: ['react'],
    treeshake: treeShakeConfig,
    preserveEntrySignatures: 'strict',
  },

  // Main library - UMD (for browsers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/react-understate.umd.js',
      format: 'umd',
      name: 'ReactUnderstate',
      ...outputConfig,
    },
    plugins: isProduction ? productionPlugins : developmentPlugins,
    external: ['react'],
    treeshake: treeShakeConfig,
    preserveEntrySignatures: 'strict',
  },

  // TypeScript declarations bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },

  // Core signals declarations bundle
  {
    input: 'src/core-only.ts',
    output: {
      file: 'dist/core.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
