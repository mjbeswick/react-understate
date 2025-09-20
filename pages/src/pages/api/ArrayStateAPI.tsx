import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';
import CodeExample from '../../components/CodeExample';

const ArrayStateAPI: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>ArrayState API</h1>
        <p className={styles.subtitle}>
          Reactive array state with convenient array methods
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>API:</span>
          <Link to="/api/state" className={styles.navLink}>
            State
          </Link>
          <Link to="/api/array-state" className={styles.navLink}>
            ArrayState
          </Link>
          <Link to="/api/derived" className={styles.navLink}>
            Derived
          </Link>
          <Link to="/api/effect" className={styles.navLink}>
            Effect
          </Link>
          <Link to="/api/action" className={styles.navLink}>
            Action
          </Link>
          <Link to="/api/batch" className={styles.navLink}>
            Batch
          </Link>
          <Link to="/api/use-understate" className={styles.navLink}>
            useUnderstate
          </Link>
        </div>
      </nav>

      <h2>Overview</h2>
      <p>
        <code>arrayState</code> provides a reactive array wrapper with
        convenient array methods that automatically trigger subscriptions when
        the array is modified. It's perfect for managing lists, collections, and
        any data that needs array-like operations.
      </p>

      <h2>Basic Usage</h2>

      <CodeExample filename="array-state-basic.ts" language="ts" />

      <h2>API Reference</h2>

      <h3>arrayState&lt;T&gt;(initialValue?, options?)</h3>
      <p>Creates a reactive array state with convenient array methods.</p>

      <CodeBlock
        language="typescript"
        code={`function arrayState<T>(
  initialValue?: T[],
  options?: ArrayStateOptions | string
): ArrayState<T>

type ArrayStateOptions = {
  name?: string;
}`}
      />

      <h4>Parameters</h4>
      <ul>
        <li>
          <code>initialValue</code> (optional): Initial array value. Defaults to
          empty array.
        </li>
        <li>
          <code>options</code> (optional): Configuration object or string name.
        </li>
      </ul>

      <h4>Returns</h4>
      <p>
        An <code>ArrayState&lt;T&gt;</code> object that extends the base{' '}
        <code>State&lt;T[]&gt;</code> with array methods.
      </p>

      <h2>Array Methods</h2>

      <h3>Mutating Methods (Trigger Subscriptions)</h3>
      <p>
        These methods modify the array and automatically trigger subscriptions:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Add items to the end
items.push(...items: T[]): number

// Remove and return the last item
items.pop(): T | undefined

// Add items to the beginning
items.unshift(...items: T[]): number

// Remove and return the first item
items.shift(): T | undefined

// Remove/add items at any position
items.splice(start: number, deleteCount?: number, ...items: T[]): T[]

// Sort the array
items.sort(compareFn?: (a: T, b: T) => number): T[]

// Reverse the array
items.reverse(): T[]

// Fill array with a value
items.fill(value: T, start?: number, end?: number): T[]`}
      />

      <h3>Non-Mutating Methods (Read-Only)</h3>
      <p>
        These methods don't modify the array and don't trigger subscriptions:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Access element by index (supports negative indices)
items.at(index: number): T | undefined

// Get array slice
items.slice(start?: number, end?: number): T[]

// Join array elements
items.join(separator?: string): string

// Search methods
items.indexOf(searchElement: T, fromIndex?: number): number
items.lastIndexOf(searchElement: T, fromIndex?: number): number
items.includes(searchElement: T, fromIndex?: number): boolean

// Find methods
items.find(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T | undefined
items.findIndex(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): number

// Transform methods
items.filter(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[]
items.map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]
items.reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U
items.reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U

// Iteration methods
items.forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void
items.some(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean
items.every(predicate: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean

// Flattening methods
items.flat(depth?: number): T[]
items.flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: T[]) => U | U[], thisArg?: This): U[]`}
      />

      <h2>Utility Methods</h2>

      <CodeBlock
        language="typescript"
        code={`// Clear the array
items.clear(): void

// Set the entire array
items.set(newArray: T[]): void

// Batch multiple operations
items.batch(fn: (arr: T[]) => void): void`}
      />

      <h2>Properties</h2>

      <CodeBlock
        language="typescript"
        code={`// Get array length
items.length: number

// Get/set array value
items.value: T[]

// Subscribe to changes
items.subscribe(fn: () => void): () => void`}
      />

      <h2>Iterator Support</h2>
      <p>
        ArrayState supports iteration with <code>for...of</code> loops, spread
        operator, and <code>Array.from()</code>:
      </p>

      <CodeBlock
        language="typescript"
        code={`const items = arrayState<string>(['a', 'b', 'c']);

// for...of loop
for (const item of items) {
  console.log(item);
}

// Spread operator
const spread = [...items];

// Array.from()
const fromArray = Array.from(items);`}
      />

      <h2>React Integration</h2>

      <CodeExample filename="array-state-react.tsx" language="tsx" />

      <h2>Best Practices</h2>

      <h3>Use Actions for Complex Operations</h3>
      <p>
        For complex array operations, wrap them in actions for better debugging
        and performance:
      </p>

      <CodeBlock
        language="typescript"
        code={`const addTodo = action((text: string) => {
  const newId = Math.max(...todos.map(t => t.id), 0) + 1;
  todos.push({ id: newId, text, completed: false });
}, 'addTodo');

const toggleTodo = action((id: number) => {
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.splice(index, 1, {
      ...todos[index],
      completed: !todos[index].completed,
    });
  }
}, 'toggleTodo');`}
      />

      <h3>Batch Multiple Operations</h3>
      <p>
        Use the <code>batch</code> method for multiple operations that should be
        treated as a single update:
      </p>

      <CodeBlock
        language="typescript"
        code={`items.batch(arr => {
  arr.push('item1');
  arr.push('item2');
  arr.sort();
  // Only triggers one subscription notification
});`}
      />

      <h3>Prefer Non-Mutating Methods for Derived Values</h3>
      <p>
        Use non-mutating methods like <code>filter</code>, <code>map</code>, and{' '}
        <code>slice</code> in derived values to avoid unnecessary
        re-computations:
      </p>

      <CodeBlock
        language="typescript"
        code={`const completedTodos = derived(() => 
  todos.filter(todo => todo.completed)
);

const todoStats = derived(() => ({
  total: todos.length,
  completed: completedTodos.value.length,
  pending: todos.length - completedTodos.value.length,
}));`}
      />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/state" className={styles.navLink}>
            ← State API
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/derived" className={styles.navLink}>
            Derived API →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArrayStateAPI;

