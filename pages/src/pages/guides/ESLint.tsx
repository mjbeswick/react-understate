import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const ESLintGuide: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>ESLint Plugin</h1>
        <p className={styles.subtitle}>
          Enforce best practices and catch common mistakes automatically
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/eslint" className={styles.navLink}>
            ESLint Plugin
          </Link>
        </div>
      </nav>

      <h2>Why use the plugin?</h2>
      <p>
        The <code>eslint-plugin-react-understate</code> package encodes project conventions
        for React Understate. It helps prevent memory leaks, avoid nested reactive calls,
        enforce subscriptions with <code>useUnderstate</code>, and encourage immutable updates and batching.
      </p>

      <h2>Installation</h2>
      <CodeBlock language="bash" code={`npm install --save-dev eslint-plugin-react-understate`} />

      <h2>Configuration</h2>
      <p>
        Use the recommended config for sensible defaults. Examples are shown for both Flat Config
        (<code>eslint.config.js</code>) and legacy <code>.eslintrc</code> formats.
      </p>

      <h3>Flat Config (eslint.config.js)</h3>
      <CodeBlock
        language="javascript"
        code={`// eslint.config.js
import js from '@eslint/js'
import ts from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactUnderstate from 'eslint-plugin-react-understate'

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
]
`} />

      <h3>Legacy (.eslintrc.*)</h3>
      <CodeBlock
        language="json"
        code={`{
  "extends": ["plugin:react-understate/recommended"]
}`} />

      <h2>Manual rule selection</h2>
      <p>
        Prefer the recommended preset, but you can enable specific rules as needed:
      </p>
      <CodeBlock
        language="javascript"
        code={`// Flat config snippet
export default [{
  rules: {
    'react-understate/require-use-subscribe-for-all-states': 'error',
    'react-understate/require-use-subscribe-store-object': 'error',
    'react-understate/no-state-creation-in-components': 'error',
    'react-understate/no-direct-state-mutation': 'error',
    'react-understate/prefer-batch-for-multiple-updates': ['warn', { minUpdates: 2 }],
  },
}]`} />

      <h2>Common rules at a glance</h2>
      <ul>
        <li><strong>Subscriptions</strong>: require <code>useUnderstate</code> for states and stores</li>
        <li><strong>No nesting</strong>: prevent nested <code>effect</code>/<code>derived</code> and other understate calls</li>
        <li><strong>Effects safety</strong>: disallow creating state/derived inside effects; encourage error handling</li>
        <li><strong>Immutability</strong>: prefer object spread for updates; forbid direct mutation</li>
        <li><strong>Performance</strong>: suggest <code>batch</code> for multiple updates</li>
      </ul>

      <h2>Example: fixing missing subscription</h2>
      <CodeBlock
        language="tsx"
        code={`// ❌ Before
const count = state(0)
function Counter() {
  return <div>{count.value}</div>
}

// ✅ After
function Counter() {
  useUnderstate(count)
  return <div>{count.value}</div>
}`} />

      <h2>Where to learn more</h2>
      <ul>
        <li>
          Plugin README in this repo: <code>eslint-plugin/README.md</code>
        </li>
      </ul>

      <div className={styles.navigation}>
        <Link to="/guides/batching" className={styles.navLink}>
          ← Batching
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/testing" className={styles.navLink}>
          Testing →
        </Link>
      </div>
    </div>
  );
};

export default ESLintGuide;


