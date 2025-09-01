# React Understate

The state management library that's so lightweight, it makes Redux feel like you're carrying a backpack full of bricks. No more wrestling with weight of useless boilerplare - just pure, unadulterated reactivity.

[![npm version](https://img.shields.io/npm/v/react-understate.svg)](https://www.npmjs.com/package/react-understate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🎯 **Simple API** - Just use `.value` to read/write state values
- ⚡ **Automatic dependency tracking** - Effects and derived values update automatically
- 🔄 **React 18+ integration** - Built with `useSyncExternalStore` for optimal performance
- 🚀 **Async support** - Built-in async update methods with loading states
- 📦 **Lightweight** - Minimal bundle size with zero dependencies
- 🎨 **TypeScript first** - Full type safety out of the box
- ⚙️ **Batching support** - Optimize performance with batched updates
- 🧊 **Automatic deep freezing** - Objects and arrays are automatically frozen to enforce immutability

## Installation

```bash
npm install react-understate
```

## Quick Start

```tsx
import { state, useSubscribe } from "react-understate";

// Create a state
const count = state(0);

function Counter() {
  // Subscribe to state changes
  useSubscribe(count);

  return (
    <div>
      <p>Count: {count.value}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

## Core Concepts

### States

States are reactive containers that hold values and notify subscribers when they change. Always use the `.value` property to read and write state values.

````tsx
import { state } from 'react-understate';

// Create states for different types
const count = state(0);
const name = state('John');
const user = state({ id: 1, name: 'John', email: 'john@example.com' });
const items = state<string[]>([]);

// ✅ CORRECT: Read and write using .value
console.log(count.value); // 0
count.value = 42;
console.log(count.value); // 42

// ✅ CORRECT: Update object properties
user.value = { ...user.value, name: 'Jane' };

// ✅ CORRECT: Update arrays
items.value = [...items.value, 'new item'];

// ❌ INCORRECT: Don't assign states to variables
// const badCount = count; // This breaks reactivity!
// const badValue = count.value; // This doesn't track changes!

### Automatic Deep Freezing

React Understate automatically deep-freezes objects and arrays to enforce immutability and prevent accidental mutations. This ensures that state values cannot be modified directly, forcing developers to use proper immutable patterns.

```tsx
const user = state({ name: 'John', age: 30 });
const items = state(['apple', 'banana']);

// ✅ CORRECT: Create new objects/arrays for updates
user.value = { ...user.value, age: 31 };
items.value = [...items.value, 'cherry'];

// ❌ INCORRECT: Direct mutations will fail
// user.value.name = 'Jane'; // This will throw an error or fail silently
// items.value.push('cherry'); // This will throw an error or fail silently

// Deep freezing works recursively
const nested = state({
  user: {
    profile: {
      preferences: { theme: 'dark' }
    }
  }
});

// All nested objects are frozen
// nested.value.user.profile.preferences.theme = 'light'; // This will fail
````

**Benefits of Deep Freezing:**

- **Prevents Bugs**: Catches accidental mutations at runtime
- **Enforces Best Practices**: Forces use of immutable update patterns
- **Improves Reactivity**: Ensures state changes are always detectable
- **Better Performance**: Helps React optimize re-renders

### Derived Values

Derived values automatically update when their dependencies change. They are lazy and only recalculate when accessed.

```tsx
import { state, derived } from "react-understate";

const firstName = state("John");
const lastName = state("Doe");

// Create a derived state
const fullName = derived(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

// Update dependencies - derived automatically updates
firstName.value = "Jane";
console.log(fullName.value); // "Jane Doe"

// Complex derived values with multiple dependencies
const count = state(5);
const multiplier = state(2);
const isEven = state(true);

const result = derived(() => {
  const base = count.value * multiplier.value;
  return isEven.value ? base : base + 1;
});

console.log(result.value); // 10 (5 * 2 = 10, isEven = true)

isEven.value = false;
console.log(result.value); // 11 (5 * 2 = 10, isEven = false, so +1)
```

### Effects

Effects run side effects when their dependencies change. They automatically track which states they depend on.

```tsx
import { state, effect } from "react-understate";

const count = state(0);
const name = state("John");

// Simple effect that logs changes
effect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

count.value = 5; // Logs: "Count: 5, Name: John"
name.value = "Jane"; // Logs: "Count: 5, Name: Jane"
```

#### Effects with Cleanup

Effects can return cleanup functions that run before the effect runs again or when disposed. Note that cleanup isn't usually needed in practice.

```tsx
import { state, effect } from "react-understate";

const count = state(0);

const dispose = effect(() => {
  console.log(`Count is now: ${count.value}`);
  return () => {
    console.log("Cleaning up...");
  };
});

count.value = 5; // Cleanup runs, then effect re-runs
dispose(); // Final cleanup
```

#### Async Effects

Effects can be async and are commonly used for API calls:

```tsx
import { state, effect } from "react-understate";

const userId = state(1);
const userData = state(null);
const loading = state(false);

effect(async () => {
  const id = userId.value;
  if (id) {
    loading.value = true;
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      userData.value = data;
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      loading.value = false;
    }
  }
});

// Effect automatically re-runs when userId changes
userId.value = 2; // Fetches user with ID 2
```

### Update Method with Async Support

The `update` method provides a powerful way to update states, especially for async operations. It includes built-in loading state management.

```tsx
import { state } from "react-understate";

const count = state(0);
const user = state({ id: 1, name: "John" });

// Sync update
await count.update((prev) => prev + 1);

// Async update with automatic loading state
await user.update(async (prev) => {
  const response = await fetch(`/api/users/${prev.id}`, {
    method: "PUT",
    body: JSON.stringify({ ...prev, name: "Updated Name" }),
  });
  return response.json();
});

// Check loading state
console.log(user.pending); // true during async operation

// Complex async update with error handling
await count.update(async (prev) => {
  const result = await fetch("/api/increment", {
    method: "POST",
    body: JSON.stringify({ current: prev }),
  });

  if (!result.ok) {
    throw new Error("Failed to increment");
  }

  const data = await result.json();
  return data.newValue;
});
```

## React Integration

### Setup

**No setup required!** React is automatically detected in all environments, just like Redux. The `useSubscribe` hook works out of the box with zero configuration.

The library automatically detects React when first used, working seamlessly with:

- Vite
- Webpack
- Create React App
- Next.js
- And any other modern bundler

The library automatically works with React 18+ using `use-sync-external-store/shim` for optimal compatibility.

### useSubscribe Hook

The `useSubscribe` hook subscribes to state changes and triggers re-renders when states update.

**Important:** The hook does NOT return a value. Access the state's `.value` property directly in your component.

```tsx
import { state, useSubscribe } from "react-understate";

const userCount = state(0);
const userName = state("Guest");

function UserDisplay() {
  // ✅ CORRECT: Use the hook to establish subscription
  useSubscribe(userCount);
  useSubscribe(userName);

  return (
    <div>
      <h1>Welcome, {name.value}!</h1>
      <p>Active users: {count.value}</p>
      <button onClick={() => userCount.value++}>Add User</button>
      <button onClick={() => (userName.value = "John")}>
        Set Name to John
      </button>
    </div>
  );
}
```

### Loading States in React

Use the `pending` property to show loading states during async updates:

```tsx
import { state, useSubscribe } from "react-understate";

const userData = state(null);

function UserProfile({ userId }) {
  useSubscribe(userData);

  const loadUser = async () => {
    await userData.update(async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    });
  };

  return (
    <div>
      <button onClick={loadUser}>Load User</button>

      {userData.pending && <p>Loading...</p>}

      {userData.value && (
        <div>
          <h2>{userData.value.name}</h2>
          <p>{userData.value.email}</p>
        </div>
      )}
    </div>
  );
}
```

### Complex React Example

Here's a more complex example with multiple signals and derived values:

```tsx
import { state, derived, useSubscribe } from "react-understate";

// State
const todos = state([]);
const filter = state("all"); // 'all', 'active', 'completed'
const newTodo = state("");

// Derived values
const filteredTodos = derived(() => {
  const allTodos = todos.value;
  const currentFilter = filter.value;

  switch (currentFilter) {
    case "active":
      return allTodos.filter((todo) => !todo.completed);
    case "completed":
      return allTodos.filter((todo) => todo.completed);
    default:
      return allTodos;
  }
});

const activeCount = derived(
  () => todos.value.filter((todo) => !todo.completed).length,
);

function TodoApp() {
  useSubscribe(todos, filter, newTodo, filteredTodos, activeCount);

  const addTodo = () => {
    if (newTodo.value.trim()) {
      todos.value = [
        ...todos.value,
        {
          id: Date.now(),
          text: newTodo.value.trim(),
          completed: false,
        },
      ];
      newTodo.value = "";
    }
  };

  const toggleTodo = (id) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  };

  const removeTodo = (id) => {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  };

  return (
    <div>
      <h1>Todo App</h1>

      <div>
        <input
          value={newTodo.value}
          onChange={(e) => (newTodo.value = e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div>
        <button
          onClick={() => (filter.value = "all")}
          style={{ fontWeight: filter.value === "all" ? "bold" : "normal" }}
        >
          All
        </button>
        <button
          onClick={() => (filter.value = "active")}
          style={{ fontWeight: filter.value === "active" ? "bold" : "normal" }}
        >
          Active ({activeCount.value})
        </button>
        <button
          onClick={() => (filter.value = "completed")}
          style={{
            fontWeight: filter.value === "completed" ? "bold" : "normal",
          }}
        >
          Completed
        </button>
      </div>

      <ul>
        {filteredTodos.value.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Batching for Performance

Use `batch` to group multiple state updates and trigger effects only once:

```tsx
import { state, batch, effect } from "react-understate";

const firstName = state("John");
const lastName = state("Doe");
const age = state(30);

// Effect that depends on multiple states
effect(() => {
  console.log(`User: ${firstName.value} ${lastName.value}, Age: ${age.value}`);
});

// Without batching - triggers effect 3 times
firstName.value = "Jane";
lastName.value = "Smith";
age.value = 25;

// With batching - triggers effect only once
batch(() => {
  firstName.value = "Jane";
  lastName.value = "Smith";
  age.value = 25;
});
// Effect runs once with all updated values: "User: Jane Smith, Age: 25"
```

Batching is especially useful in event handlers:

```tsx
const count = state(0);
const isLoading = state(false);

const handleClick = () => {
  batch(() => {
    isLoading.value = true;
    count.value++;
    // Both changes are processed together
  });
};
```

## Advanced Patterns

### Signal Composition

```tsx
import { state, derived, effect } from "react-understate";

// Base states
const x = state(0);
const y = state(0);

// Derived coordinates
const position = derived(() => ({ x: x.value, y: y.value }));
const distance = derived(() => Math.sqrt(x.value ** 2 + y.value ** 2));

// Effect for side effects
effect(() => {
  console.log(`Position: (${position.value.x}, ${position.value.y})`);
  console.log(`Distance from origin: ${distance.value.toFixed(2)}`);
});

// Update coordinates
x.value = 3;
y.value = 4;
// Logs: "Position: (3, 4)" and "Distance from origin: 5.00"
```

### Form Validation

```tsx
import { state, derived } from "react-understate";

const email = state("");
const password = state("");
const confirmPassword = state("");

const emailValid = derived(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
);

const passwordValid = derived(() => password.value.length >= 8);

const passwordsMatch = derived(() => password.value === confirmPassword.value);

const formValid = derived(
  () => emailValid.value && passwordValid.value && passwordsMatch.value,
);

function SignupForm() {
  useSubscribe(email);
  useSubscribe(password);
  useSubscribe(confirmPassword);
  useSubscribe(formValid);

  return (
    <form>
      <input
        type="email"
        value={email.value}
        onChange={(e) => (email.value = e.target.value)}
        placeholder="Email"
      />
      {!emailValid.value && email.value && <p>Please enter a valid email</p>}

      <input
        type="password"
        value={password.value}
        onChange={(e) => (password.value = e.target.value)}
        placeholder="Password"
      />
      {!passwordValid.value && password.value && (
        <p>Password must be at least 8 characters</p>
      )}

      <input
        type="password"
        value={confirmPassword.value}
        onChange={(e) => (confirmPassword.value = e.target.value)}
        placeholder="Confirm Password"
      />
      {!passwordsMatch.value && confirmPassword.value && (
        <p>Passwords do not match</p>
      )}

      <button type="submit" disabled={!formValid.value}>
        Sign Up
      </button>
    </form>
  );
}
```

## API Reference

### Core Functions

#### `state<T>(initialValue: T): State<T>`

Creates a reactive state with an initial value.

#### `derived<T>(computeFn: () => T): ReadonlyState<T>`

Creates a read-only state that automatically updates when dependencies change.

#### `effect(fn: () => void | (() => void)): () => void`

Runs a side effect that automatically re-executes when dependencies change. Returns a disposal function.

#### `batch(fn: () => void): void`

Batches multiple state updates into a single effect flush.

### React Integration

#### `useSubscribe<T>(signal: State<T> | ReadonlyState<T>): void`

React hook to subscribe to state changes and trigger re-renders.

### State Properties

#### `.value: T`

Gets or sets the state value. Reading establishes a dependency, writing triggers updates.

#### `.rawValue: T`

Gets the state value without establishing a dependency.

#### `.pending: boolean`

Whether the signal is currently being updated (useful for async operations).

#### `.update(fn: (prev: T) => T | Promise<T>): Promise<void>`

Updates the signal using a function that receives the previous value.

#### `.subscribe(fn: () => void): () => void`

Subscribes to signal changes. Returns an unsubscribe function.

## Best Practices

1. **Always use `.value`** - Never assign signals to variables for storage
2. **Create signals at module level** - Don't create signals inside components
3. **Use `useSubscribe` in React** - Always call it for signals used in components
4. **Batch related updates** - Use `batch()` for multiple simultaneous updates
5. **Prefer derived over effects** - Use derived for derived state, effects for side effects
6. **Clean up effects** - Always call the disposal function when appropriate
7. **Use TypeScript** - Take advantage of full type safety

## License

MIT © [mjbeswick](https://github.com/mjbeswick)
