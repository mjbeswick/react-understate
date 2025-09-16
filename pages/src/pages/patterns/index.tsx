import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';

const PatternsIndex: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>React Understate Cookbook</h1>
        <p className={styles.subtitle}>
          Real-world patterns and best practices for building applications
        </p>
      </header>

      <p>
        This cookbook contains practical patterns, recipes, and real-world
        examples for building applications with React Understate. Each pattern
        includes complete code examples, explanations, and guidance on when to
        use them.
      </p>

      <div
        className="pattern-grid"
        style={{ display: 'grid', gap: '2rem', marginTop: '3rem' }}
      >
        <div className="pattern-category">
          <h2>🏗️ Architecture Patterns</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/store-pattern" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Store Pattern
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Organize related state, actions, and derived values in a
                  single module
                </p>
              </div>
            </Link>

            <Link to="/patterns/state-composition" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  State Composition
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Compose complex state from smaller, focused state atoms
                </p>
              </div>
            </Link>

            <Link to="/patterns/action-composition" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Action Composition
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Build complex workflows by composing simple actions
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="pattern-category">
          <h2>🔄 Data Flow Patterns</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/filtering-sorting" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Filtering & Sorting
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Use derived values for dynamic data filtering and sorting
                </p>
              </div>
            </Link>

            <Link to="/patterns/async-data" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Async Data Loading
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Handle async operations with loading states and error handling
                </p>
              </div>
            </Link>

            <Link to="/patterns/form-validation" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Form Validation
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Real-time form validation with derived state
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="pattern-category">
          <h2>💾 Persistence Patterns</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/local-storage" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Local Storage
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Persist state to localStorage with automatic hydration
                </p>
              </div>
            </Link>

            <Link to="/patterns/session-storage" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Session Storage
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Temporary persistence that survives page reloads
                </p>
              </div>
            </Link>

            <Link to="/patterns/api-sync" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  API Synchronization
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Keep local state synchronized with remote APIs
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="pattern-category">
          <h2>🎮 Interaction Patterns</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/keyboard-shortcuts" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Keyboard Shortcuts
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Handle keyboard input with effects and actions
                </p>
              </div>
            </Link>

            <Link to="/patterns/optimistic-updates" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Optimistic Updates
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Update UI immediately, then sync with server
                </p>
              </div>
            </Link>

            <Link to="/patterns/undo-redo" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Undo/Redo
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Implement undo/redo functionality with state history
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="pattern-category">
          <h2>🧪 Testing Patterns</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/state-testing" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  State Testing
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Test state mutations and derived values
                </p>
              </div>
            </Link>

            <Link to="/patterns/action-testing" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Action Testing
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Test complex action workflows and side effects
                </p>
              </div>
            </Link>

            <Link to="/patterns/component-testing" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Component Testing
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Test React components that use React Understate
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="pattern-category">
          <h2>📚 Complete Examples</h2>
          <div
            className="pattern-links"
            style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}
          >
            <Link to="/patterns/todo-app" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Todo Application
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Complete todo app with persistence, filtering, and statistics
                </p>
              </div>
            </Link>

            <Link to="/patterns/calculator" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Calculator
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  Calculator with keyboard support and complex state management
                </p>
              </div>
            </Link>

            <Link to="/patterns/shopping-cart" className={styles.link}>
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                  Shopping Cart
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                  E-commerce cart with items, quantities, and totals
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/patterns/store-pattern" className={styles.navLink}>
            Store Pattern →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatternsIndex;
