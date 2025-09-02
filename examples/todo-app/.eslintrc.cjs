module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-understate', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'react/react-in-jsx-scope': 'off',

    // react-understate rules
    'react-understate/require-use-subscribe': 'error',
    'react-understate/prefer-batch-for-multiple-updates': ['warn', { minUpdates: 2 }],
    'react-understate/no-direct-state-assignment': 'error',
    'react-understate/no-state-creation-in-components': 'error',
    'react-understate/no-nested-effects': 'error',
    'react-understate/no-nested-derived': 'error',
    'react-understate/prefer-derived-for-computed': 'warn',
    'react-understate/prefer-effect-for-side-effects': 'warn',
    'react-understate/no-unused-states': 'warn',
    'react-understate/require-use-subscribe-for-all-states': 'warn',
    'react-understate/require-error-handling-in-async-updates': 'warn',
    'react-understate/prefer-object-spread-for-updates': 'warn',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
};


