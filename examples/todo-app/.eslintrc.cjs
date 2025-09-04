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
    'plugin:react-understate/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react-understate', 'react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/no-import-type-side-effects': 'error',

    // Disable conflicting base rules
    'no-unused-vars': 'off',

    // Code quality rules
    'no-console': 'off', // Allow console in examples
    'no-debugger': 'error',
    'no-alert': 'error',

    // Style rules (complementing Prettier)
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    indent: ['error', 2, { SwitchCase: 1 }],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',

    // Best practices
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-useless-concat': 'error',
    'prefer-template': 'error',
    'prefer-arrow-functions': ['error', { allowNamedFunctions: true }],
    'object-shorthand': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'no-constructor-return': 'error',
    'no-return-await': 'error',
    'prefer-promise-reject-errors': 'error',

    // React specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off', // TypeScript handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.d.ts'],
};
