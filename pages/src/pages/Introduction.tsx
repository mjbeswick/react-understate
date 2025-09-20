import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Introduction.module.css';
import CodeExample from '../components/CodeExample';

const Introduction: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Introduction</h1>
        <p className={styles.subtitle}>How to use React Understate</p>
      </header>

      <p>
        A small, fast, and scalable state management solution for React. React
        Understate has a comfy API based on hooks and reactive primitives. It
        isn't boilerplatey or opinionated, but has enough convention to be
        explicit and predictable.
      </p>

      <p>
        Don’t let the simplicity fool you—there’s real muscle under the hood!
        React Understate is designed to sidestep common pitfalls, reduce code
        complexity, and deliver top-notch performance. The focus? Speed,
        scalability, and a blissful lack of boilerplate. The API is
        intentionally straightforward and intuitive, so you can be productive in
        minutes!
      </p>

      <p>I hope that React Understate brings you joy and productivity!</p>

      <h2>Installation</h2>

      <p>React Understate is available as a package on NPM for use:</p>

      <CodeExample language="bash" filename="introduction.txt" />

      <h2>First create a state</h2>

      <p>
        Your state is reactive! You can put anything in it: primitives, objects,
        functions. The <code>set</code> function <em>replaces</em> state.
      </p>

      <CodeExample filename="introduction-2.ts" language="typescript" />

      <h2>Then bind your components, and that's it!</h2>

      <p>
        You can use the state anywhere, without the need of providers. Select
        your state and the consuming component will re-render when that state
        changes.
      </p>

      <CodeExample filename="introduction-3.tsx" language="tsx" />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/getting-started/installation" className={styles.navLink}>
            Installation →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
