import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';
import CodeExample from '../../components/CodeExample';

const StateManagement: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>State Management Guide</h1>
        <p className={styles.subtitle}>
          Complete guide to managing state in React Understate applications
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/state-management" className={styles.navLink}>
            State Management
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        State management is the foundation of any React application. React
        Understate provides a simple yet powerful approach to state management
        that scales from simple components to complex applications. This guide
        covers everything you need to know about managing state effectively.
      </p>

      <div
        className="guide-overview"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>🎯 What You'll Learn</h3>
        <ul style={{ margin: 0 }}>
          <li>Creating and organizing state atoms</li>
          <li>State composition patterns</li>
          <li>Managing complex state structures</li>
          <li>Performance optimization techniques</li>
          <li>Debugging and development tools</li>
          <li>Common patterns and anti-patterns</li>
        </ul>
      </div>

      <h2>Creating State</h2>
      <p>
        The `state()` function is the building block of React Understate. It
        creates reactive state atoms that can be subscribed to and updated
        independently.
      </p>

      <CodeExample
        filename="state-management-creating-state.ts"
        language="ts"
      />

      <h2>Reading State</h2>
      <p>
        React Understate provides multiple ways to read state values depending
        on your use case and performance requirements.
      </p>

      <CodeExample
        filename="state-management-reading-state.tsx"
        language="tsx"
      />

      <h2>Updating State</h2>
      <p>
        State updates in React Understate are straightforward and can be done
        synchronously or asynchronously, with automatic batching for
        performance.
      </p>

      <CodeExample filename="state-management-updates.ts" language="ts" />

      <h3>Best Practice: Use Actions for State Updates</h3>
      <p>
        While you can update state directly, it's recommended to use{' '}
        <code>action()</code> functions for all state updates. This provides
        better debugging, performance, and maintainability.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Avoid: Direct state updates
const count = state(0, { name: 'count' });

// Direct assignment
count.value = 42;

// Direct function call
count(prev => prev + 1);

// ✅ Good: Use actions for state updates
const count = state(0, { name: 'count' });

const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

const incrementCount = action(() => {
  count.value = count.value + 1;
}, 'incrementCount');

// Use actions instead
setCount(42);
incrementCount();`}
      />

      <p>
        <strong>Benefits of using actions:</strong>
      </p>
      <ul>
        <li>
          <strong>Debugging:</strong> Actions appear in debug logs with clear
          names
        </li>
        <li>
          <strong>Performance:</strong> Actions can be batched and optimized
        </li>
        <li>
          <strong>Consistency:</strong> All state updates follow the same
          pattern
        </li>
        <li>
          <strong>Testing:</strong> Actions are easier to test in isolation
        </li>
        <li>
          <strong>ESLint support:</strong> The ESLint plugin can warn about
          state updates in effects
        </li>
      </ul>

      <h2>State Composition Patterns</h2>
      <p>
        Breaking down complex state into smaller, focused atoms makes your
        application more maintainable and performant.
      </p>

      <CodeExample filename="state-management-composition.ts" language="ts" />

      <h2>Managing Complex State</h2>
      <p>
        For complex state structures, use patterns that maintain immutability
        and provide clear update semantics.
      </p>

      <CodeExample
        filename="state-management-entity-pattern.ts"
        language="ts"
      />

      <h2>State Normalization</h2>
      <p>
        For complex relational data, normalize your state structure to avoid
        duplication and make updates more efficient.
      </p>

      <CodeExample filename="state-management-normalization.ts" language="ts" />

      <h2>Performance Optimization</h2>
      <p>
        React Understate provides several patterns to optimize performance in
        large applications.
      </p>

      <CodeExample filename="state-management-performance.ts" language="ts" />

      <h2>Debugging State</h2>
      <p>
        React Understate provides excellent debugging capabilities to help you
        understand state changes and track down issues.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { configureDebug } from 'react-understate';

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  configureDebug({
    enabled: true,
    logStateChanges: true,
    logActionCalls: true,
    logDerivedUpdates: true,
    filter: (name) => {
      // Only log specific states/actions
      return name.includes('user') || name.includes('todo');
    },
  });
}

// Custom debug logging for specific states
export const debuggedUser = state({ name: '', email: '' }, {
  name: 'debuggedUser',
  debug: {
    logChanges: true,
    beforeChange: (oldValue, newValue) => {
      console.log('User changing from:', oldValue, 'to:', newValue);
    },
    afterChange: (newValue) => {
      console.log('User changed to:', newValue);
    },
  },
});

// Debug utilities
export const stateSnapshot = () => {
  return {
    user: user(),
    todos: todos(),
    ui: uiSettings(),
    timestamp: new Date().toISOString(),
  };
};

export const logStateSnapshot = action(() => {
  console.log('action: logging state snapshot');
  console.table(stateSnapshot());
}, { name: 'logStateSnapshot' });

// Performance monitoring
export const performanceMonitor = effect(() => {
  const startTime = performance.now();
  
  // Track expensive derived value
  const result = expensiveComputation();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // Longer than one frame
    console.warn(\`Expensive computation took \${duration.toFixed(2)}ms\`);
  }
  
  return result;
}, { name: 'performanceMonitor' });`}
      />

      <h2>Common Patterns</h2>
      <p>
        Here are some common patterns that work well with React Understate's
        state management approach.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Loading states pattern
export const createAsyncState = <T>(initialData: T) => {
  const data = state(initialData, { name: 'data' });
  const loading = state(false, { name: 'loading' });
  const error = state<string | null>(null, { name: 'error' });
  
  const isIdle = derived(() => !loading() && !error(), { name: 'isIdle' });
  const hasError = derived(() => error() !== null, { name: 'hasError' });
  
  return { data, loading, error, isIdle, hasError };
};

// 2. Form state pattern
export const createFormState = <T extends Record<string, any>>(initialValues: T) => {
  const values = state(initialValues, { name: 'formValues' });
  const errors = state<Partial<Record<keyof T, string>>>({}, { name: 'formErrors' });
  const touched = state<Partial<Record<keyof T, boolean>>>({}, { name: 'formTouched' });
  const isSubmitting = state(false, { name: 'isSubmitting' });
  
  const isValid = derived(() => Object.keys(errors()).length === 0, { name: 'isValid' });
  const isDirty = derived(() => {
    const current = values();
    return Object.keys(current).some(key => current[key] !== initialValues[key]);
  }, { name: 'isDirty' });
  
  const setValue = action((field: keyof T, value: any) => {
    values(prev => ({ ...prev, [field]: value }));
    touched(prev => ({ ...prev, [field]: true }));
  }, { name: 'setValue' });
  
  const setError = action((field: keyof T, error: string) => {
    errors(prev => ({ ...prev, [field]: error }));
  }, { name: 'setError' });
  
  const clearError = action((field: keyof T) => {
    errors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, { name: 'clearError' });
  
  const reset = action(() => {
    values(initialValues);
    errors({});
    touched({});
    isSubmitting(false);
  }, { name: 'reset' });
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    reset,
  };
};

// 3. Modal/Dialog state pattern
export const createModalState = () => {
  const isOpen = state(false, { name: 'modalOpen' });
  const data = state<any>(null, { name: 'modalData' });
  
  const open = action((modalData?: any) => {
    console.log('action: opening modal');
    isOpen(true);
    if (modalData !== undefined) {
      data(modalData);
    }
  }, { name: 'openModal' });
  
  const close = action(() => {
    console.log('action: closing modal');
    isOpen(false);
    data(null);
  }, { name: 'closeModal' });
  
  const toggle = action(() => {
    console.log('action: toggling modal');
    isOpen(prev => !prev);
  }, { name: 'toggleModal' });
  
  return { isOpen, data, open, close, toggle };
};

// Usage examples
export const userAsyncState = createAsyncState({ id: null, name: '', email: '' });
export const loginForm = createFormState({ email: '', password: '' });
export const confirmModal = createModalState();`}
      />

      <h2>Anti-Patterns to Avoid</h2>
      <p>
        Here are common mistakes to avoid when managing state with React
        Understate.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Don't mutate state directly
const badUpdate = () => {
  const currentTodos = todos();
  currentTodos.push(newTodo); // Mutates the array!
  todos(currentTodos); // This won't trigger updates correctly
};

// ✅ Always create new objects/arrays
const goodUpdate = () => {
  todos(prev => [...prev, newTodo]);
};

// ❌ Don't create state inside components
function BadComponent() {
  const [localState] = useState(() => state(0)); // Creates new state on every render!
  return <div>{useUnderstate(localState)}</div>;
}

// ✅ Create state outside components or use useState for local state
const componentState = state(0, { name: 'componentState' });

function GoodComponent() {
  const value = useUnderstate(componentState);
  return <div>{value}</div>;
}

// ❌ Don't use state for derived values
const totalItems = state(0, { name: 'totalItems' });

const updateTotal = () => {
  totalItems(todos().length); // Manual sync required!
};

// ✅ Use derived for computed values
const totalItems = derived(() => todos().length, { name: 'totalItems' });

// ❌ Don't ignore batching for multiple updates
const slowUpdate = () => {
  user(prev => ({ ...prev, name: 'John' }));    // Triggers re-render
  user(prev => ({ ...prev, email: 'john@...' })); // Triggers re-render
  user(prev => ({ ...prev, age: 30 }));           // Triggers re-render
};

// ✅ Use batch() for multiple related updates
const fastUpdate = () => {
  batch(() => {
    user(prev => ({ ...prev, name: 'John' }));
    user(prev => ({ ...prev, email: 'john@...' }));
    user(prev => ({ ...prev, age: 30 }));
    // Only one re-render for all updates
  });
};

// ❌ Don't create circular dependencies
const a = derived(() => b() + 1, { name: 'a' });
const b = derived(() => a() + 1, { name: 'b' }); // Circular!

// ✅ Design dependencies as a directed acyclic graph
const base = state(0, { name: 'base' });
const derived1 = derived(() => base() + 1, { name: 'derived1' });
const derived2 = derived(() => derived1() * 2, { name: 'derived2' });`}
      />

      <h2>Next Steps</h2>
      <p>
        Now that you understand the fundamentals of state management, explore
        these related topics:
      </p>

      <div className={styles.navigation}>
        <Link to="/guides/derived-values" className={styles.navLink}>
          Derived Values Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/effects" className={styles.navLink}>
          Effects Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API Reference
        </Link>
      </div>
    </div>
  );
};

export default StateManagement;
