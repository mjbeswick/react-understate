import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';

const StateAPIContent: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>state()</h1>
        <p className={styles.subtitle}>
          Create reactive state that automatically updates components
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signature</h2>
        <div className={styles.apiSignature}>
          state&lt;T&gt;(initialValue: T, debugName?: string): State&lt;T&gt;
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>initialValue</span>
            <span className={styles.parameterType}>T</span>
            <div className={styles.parameterDescription}>
              The initial value for the state. Can be any type: primitives,
              objects, arrays, functions, etc.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>debugName</span>
            <span className={styles.parameterType}>string (optional)</span>
            <div className={styles.parameterDescription}>
              A name for debugging purposes. Shows up in dev tools and debug
              logs when debugging is enabled.
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>state()</code> function creates reactive state that
        automatically notifies React components when the value changes. It's the
        core building block of React Understate and works with any data type.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🚀 Zero Configuration</div>
          <div className={styles.featureDescription}>
            Works immediately without providers, contexts, or setup. Just create
            and use.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>⚡ Automatic Updates</div>
          <div className={styles.featureDescription}>
            Components automatically re-render when state changes. No manual
            subscriptions needed.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Type Safe</div>
          <div className={styles.featureDescription}>
            Full TypeScript support with automatic type inference and
            compile-time safety.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>📦 Any Data Type</div>
          <div className={styles.featureDescription}>
            Store primitives, objects, arrays, functions, classes - anything
            JavaScript supports.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Basic Usage</h2>
        <h3>Primitive Values</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, useUnderstate } from 'react-understate';

// Create state with any primitive value
const count = state(0);
const name = state('John Doe');
const isLoggedIn = state(false);

function Counter() {
  const [currentCount] = useUnderstate(count);
  
  return (
    <div>
      <h2>Count: {currentCount}</h2>
      <button onClick={() => count.value++}>
        Increment
      </button>
      <button onClick={() => count.value = 0}>
        Reset
      </button>
    </div>
  );
}`}
        />

        <h3>Objects and Arrays</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, useUnderstate } from 'react-understate';

// Object state
const user = state({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Array state  
const todos = state([
  { id: 1, text: 'Learn React Understate', completed: false },
  { id: 2, text: 'Build awesome app', completed: false }
]);

function UserProfile() {
  const [currentUser] = useUnderstate(user);
  const [currentTodos] = useUnderstate(todos);
  
  const updateTheme = () => {
    user.value = {
      ...user.value,
      preferences: {
        ...user.value.preferences,
        theme: user.value.preferences.theme === 'dark' ? 'light' : 'dark'
      }
    };
  };
  
  const addTodo = (text: string) => {
    todos.value = [
      ...todos.value,
      { id: Date.now(), text, completed: false }
    ];
  };
  
  return (
    <div>
      <h2>{currentUser.name}</h2>
      <p>Theme: {currentUser.preferences.theme}</p>
      <button onClick={updateTheme}>Toggle Theme</button>
      
      <h3>Todos ({currentTodos.length})</h3>
      {currentTodos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}`}
        />

        <h3>Functions in State</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, useUnderstate } from 'react-understate';

// Store functions in state
const mathOperation = state((a: number, b: number) => a + b);
const validationRules = state({
  email: (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email),
  password: (pwd: string) => pwd.length >= 8
});

function Calculator() {
  const [operation] = useUnderstate(mathOperation);
  const [rules] = useUnderstate(validationRules);
  
  const switchToMultiply = () => {
    mathOperation.value = (a, b) => a * b;
  };
  
  return (
    <div>
      <p>5 + 3 = {operation(5, 3)}</p>
      <button onClick={switchToMultiply}>
        Switch to Multiplication
      </button>
      
      <p>Valid email: {rules.email('test@example.com') ? 'Yes' : 'No'}</p>
    </div>
  );
}`}
        />
      </div>

      <h2>Direct Value Access</h2>
      <p>
        Access and modify state values directly using the <code>.value</code>{' '}
        property. This is the most efficient way to work with state outside of
        React components.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state } from 'react-understate';

const counter = state(0);
const settings = state({ theme: 'light', lang: 'en' });

// Read values directly
console.log(counter.value); // 0
console.log(settings.value.theme); // 'light'

// Update values directly
counter.value = 10;
counter.value++; // Now 11

// Update objects (always replace the entire object)
settings.value = { ...settings.value, theme: 'dark' };

// Or completely replace
settings.value = { theme: 'auto', lang: 'fr' };`}
      />

      <h2>Subscription API</h2>
      <p>
        Subscribe to state changes outside of React components. Useful for side
        effects, logging, persistence, or integration with other libraries.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state } from 'react-understate';

const count = state(0);

// Subscribe to changes
const unsubscribe = count.subscribe((newValue, previousValue) => {
  console.log(\`Count changed from \${previousValue} to \${newValue}\`);
});

// Trigger the subscription
count.value = 5; // Logs: "Count changed from 0 to 5"
count.value = 10; // Logs: "Count changed from 5 to 10"

// Clean up when done
unsubscribe();

// Multiple subscribers
const unsubscribe1 = count.subscribe((value) => {
  localStorage.setItem('count', String(value));
});

const unsubscribe2 = count.subscribe((value) => {
  if (value > 100) {
    alert('Count is getting high!');
  }
});

// Clean up all
const cleanup = () => {
  unsubscribe1();
  unsubscribe2();
};`}
      />

      <h2>Store Pattern</h2>
      <p>
        For complex applications, consider using the{' '}
        <Link to="/patterns/store-pattern">Store Pattern</Link> to organize
        related state and actions together. This provides better separation of
        concerns and makes your code more maintainable.
      </p>

      <h2>Debugging</h2>
      <p>Use debug names to identify state in development tools and logs.</p>

      <CodeBlock
        language="tsx"
        code={`import { state, configureDebug } from 'react-understate';

// Enable debugging globally
configureDebug({ enabled: true, showFile: true });

// Create state with debug names
const userCount = state(0, 'userCount');
const activeUsers = state([], 'activeUsersList');
const appSettings = state({
  theme: 'light',
  notifications: true
}, 'appSettings');

// Changes will now be logged with names:
userCount.value = 42; 
// Logs: "[userCount] State changed from 0 to 42"

activeUsers.value = [{ id: 1, name: 'John' }];
// Logs: "[activeUsersList] State changed from [] to [{ id: 1, name: 'John' }]"`}
      />

      <h2>Performance & Patterns</h2>
      <p>For performance optimization techniques and advanced patterns, see:</p>
      <ul>
        <li>
          <Link to="/patterns/performance-optimization">
            Performance Optimization
          </Link>{' '}
          - Best practices for optimal performance
        </li>
        <li>
          <Link to="/patterns/state-composition">State Composition</Link> -
          Advanced patterns for combining states
        </li>
        <li>
          <Link to="/guides/state-management">State Management Guide</Link> -
          Comprehensive state management strategies
        </li>
      </ul>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/derived" className={styles.navLink}>
            derived() →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StateAPIContent;
