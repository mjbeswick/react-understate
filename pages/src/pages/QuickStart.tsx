import React from 'react';
import { Link } from 'react-router-dom';
import styles from './QuickStart.module.css';
import CodeExample from '../components/CodeExample';

const QuickStart: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Quick Start</h1>
        <p className={styles.subtitle}>
          Build your first React Understate application
        </p>
      </header>

      <h2>Your First Counter</h2>

      <p>
        Let's build a simple counter to understand the core concepts of React
        Understate.
      </p>

      <h3>Step 1: Create State</h3>

      <CodeExample filename="quickstart.ts" language="ts" />

      <h3>Step 2: Use in Components</h3>

      <CodeExample filename="quickstart-basic-counter" language="tsx" />

      <h3>Step 3: Add Derived State</h3>

      <p>
        Create computed values that automatically update when dependencies
        change:
      </p>

      <CodeExample filename="quickstart-derived-state" language="tsx" />

      <h2>Working with Objects</h2>

      <p>React Understate works seamlessly with complex state objects:</p>

      <CodeExample filename="quickstart-objects" language="tsx" />

      <h2>Adding Effects</h2>

      <p>Handle side effects that should run when state changes:</p>

      <CodeExample filename="quickstart-effects" language="tsx" />

      <h2>Performance with Batching</h2>

      <p>Batch multiple updates to prevent unnecessary re-renders:</p>

      <CodeExample filename="quickstart-batching" language="tsx" />

      <h2>Next Steps</h2>

      <p>You now have the basics! Here's what to explore next:</p>

      <ul>
        <li>
          <Link to="/guides/state-management">State Management Patterns</Link>
        </li>
        <li>
          <Link to="/guides/derived-values">Advanced Derived Values</Link>
        </li>
        <li>
          <Link to="/guides/effects">Working with Effects</Link>
        </li>
        <li>
          <Link to="/api/state">Complete API Reference</Link>
        </li>
        <li>
          <Link to="/examples/todo">More Examples</Link>
        </li>
      </ul>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/getting-started/installation" className={styles.navLink}>
            ← Installation
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/guides/state-management" className={styles.navLink}>
            State Management →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickStart;
