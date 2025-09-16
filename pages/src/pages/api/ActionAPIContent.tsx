import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';
import CodeExample from '../../components/CodeExample';

const ActionAPIContent: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>action()</h1>
        <p className={styles.subtitle}>
          Create named, debuggable functions that modify state
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signature</h2>
        <div className={styles.apiSignature}>
          action&lt;T extends (...args: any[]) =&gt; any&gt;(fn: T, debugName?:
          string): T
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>fn</span>
            <span className={styles.parameterType}>
              T extends (...args: any[]) =&gt; any
            </span>
            <div className={styles.parameterDescription}>
              The function that performs state modifications. Can be sync or
              async, with any number of parameters.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>debugName</span>
            <span className={styles.parameterType}>string (optional)</span>
            <div className={styles.parameterDescription}>
              A name for debugging purposes. Shows up in dev tools and debug
              logs when debugging is enabled. If not provided, the function name
              will be used.
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>action()</code> function wraps regular functions to provide
        enhanced debugging, performance tracking, and better development
        experience. Actions are the recommended way to modify state in React
        Understate applications.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🐛 Enhanced Debugging</div>
          <div className={styles.featureDescription}>
            Action calls are logged with their names, parameters, and execution
            time in debug mode.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>📊 Performance Tracking</div>
          <div className={styles.featureDescription}>
            Automatically tracks execution time and helps identify performance
            bottlenecks.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔄 Async Support</div>
          <div className={styles.featureDescription}>
            Works seamlessly with async functions and provides proper error
            handling.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Zero Overhead</div>
          <div className={styles.featureDescription}>
            In production builds, actions have minimal overhead and behave like
            regular functions.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Basic Usage</h2>

        <h3>Simple Actions</h3>
        <CodeExample filename="action-basic-usage" language="tsx" />

        <h3>Complex State Actions</h3>
        <CodeExample filename="action-complex-state" language="tsx" />
      </div>

      <h2>Async Actions</h2>
      <p>
        Actions work seamlessly with async operations, providing proper error
        handling and loading state management.
      </p>

      <CodeExample filename="action-async" language="tsx" />

      <h2>Action Composition</h2>
      <p>
        Actions can call other actions, enabling complex workflows and reusable
        logic.
      </p>

      <CodeExample filename="action-composition" language="tsx" />

      <h2>Performance Optimization</h2>

      <h3>Batching Multiple Updates</h3>
      <p>
        Use the <code>batch()</code> function within actions to group multiple
        state updates and prevent unnecessary re-renders.
      </p>

      <CodeExample filename="action-batching" language="tsx" />

      <h2>Error Handling Patterns</h2>
      <CodeExample filename="action-error-handling" language="tsx" />

      <h2>Debugging Actions</h2>
      <CodeExample filename="action-debugging" language="tsx" />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/derived" className={styles.navLink}>
            ← derived()
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/effect" className={styles.navLink}>
            effect() →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActionAPIContent;
