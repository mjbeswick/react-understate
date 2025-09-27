// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactUnderstate from 'eslint-plugin-react-understate';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-understate': reactUnderstate,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...reactUnderstate.configs.recommended.rules,
    },
  },
];
