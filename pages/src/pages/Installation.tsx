import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Installation.module.css';
import CodeBlock from '../components/CodeBlock';

const Installation: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Installation</h1>
        <p className={styles.subtitle}>
          Get React Understate up and running in your project
        </p>
      </header>

      <h2>Package Manager Installation</h2>

      <p>
        React Understate is available as a package on NPM for use with Node.js:
      </p>

      <h3>npm</h3>
      <CodeBlock language="bash" code="npm install react-understate" />

      <h3>yarn</h3>
      <CodeBlock language="bash" code="yarn add react-understate" />

      <h3>pnpm</h3>
      <CodeBlock language="bash" code="pnpm add react-understate" />

      <h3>bun</h3>
      <CodeBlock language="bash" code="bun add react-understate" />

      <h2>CDN Installation</h2>

      <p>
        For quick prototyping or if you prefer not to use a build tool, you can
        use React Understate via CDN:
      </p>

      <CodeBlock
        language="html"
        code={`<!-- UMD build -->
<script src="https://unpkg.com/react-understate@latest/dist/react-understate.umd.js"></script>

<!-- ES Module build -->
<script type="module">
  import { state, derived, effect } from 'https://unpkg.com/react-understate@latest/dist/react-understate.esm.js'
</script>`}
      />

      <h2>TypeScript Support</h2>

      <p>
        React Understate is written in TypeScript and includes built-in type
        definitions. No additional <code>@types</code> package is needed.
      </p>

      <h2>Browser Compatibility</h2>

      <p>
        React Understate supports all modern browsers and environments that
        support:
      </p>

      <ul>
        <li>ES2018+ features</li>
        <li>React 16.8+ (hooks support)</li>
        <li>WeakMap and WeakSet</li>
        <li>Proxy objects</li>
      </ul>

      <h2>Framework Integration</h2>

      <h3>Vite</h3>
      <p>
        React Understate works out of the box with Vite. No additional
        configuration needed.
      </p>

      <h3>Create React App</h3>
      <p>
        Compatible with Create React App projects. Simply install and import.
      </p>

      <h3>Next.js</h3>
      <p>
        Works with both Next.js App Router and Pages Router. Supports SSR out of
        the box.
      </p>

      <h3>Remix</h3>
      <p>
        Full compatibility with Remix. Use in both client and server components.
      </p>

      <h2>Bundle Size</h2>

      <p>React Understate is designed to be lightweight:</p>

      <ul>
        <li>
          <strong>Minified:</strong> ~8KB
        </li>
        <li>
          <strong>Minified + Gzipped:</strong> ~3KB
        </li>
        <li>
          <strong>Zero dependencies</strong>
        </li>
      </ul>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/getting-started/introduction" className={styles.navLink}>
            ← Introduction
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/getting-started/quick-start" className={styles.navLink}>
            Quick Start →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Installation;
