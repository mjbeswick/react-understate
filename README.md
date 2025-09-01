# React Understate

A lightweight, reactive signals library for React 18+ with automatic dependency tracking and optimized performance.

[![npm version](https://badge.fury.io/js/react-understate.svg)](https://badge.fury.io/js/react-understate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🎯 **Simple API** - Just use `.value` to read/write signal values
- ⚡ **Automatic dependency tracking** - Effects and computed values update automatically
- 🔄 **React 18+ integration** - Built with `useSyncExternalStore` for optimal performance
- 🚀 **Async support** - Built-in async update methods with loading states
- 📦 **Lightweight** - Minimal bundle size with zero dependencies
- 🎨 **TypeScript first** - Full type safety out of the box
- ⚙️ **Batching support** - Optimize performance with batched updates

## Installation

```bash
npm install react-understate
```

## Quick Start

```tsx
import React from "react";
import { signal, useSubscribe, setReact } from "react-understate";

// Set React for signal integration (call once at app startup)
setReact(React);

// Create a signal
const count = signal(0);

function Counter() {
  // Subscribe to signal changes
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

### Signals

Signals are reactive containers that hold values and notify subscribers when they change. Always use the `.value` property to read and write signal values.

```tsx
import { signal } from "react-understate";

// Create signals for different types
const count = signal(0);
const name = signal("John");
const user = signal({ id: 1, name: "John", email: "john@example.com" });
const items = signal<string[]>([]);

// ✅ CORRECT: Read and write using .value
console.log(count.value); // 0
count.value = 42;
console.log(count.value); // 42

// ✅ CORRECT: Update object properties
user.value = { ...user.value, name: "Jane" };

// ✅ CORRECT: Update arrays
items.value = [...items.value, "new item"];

// ❌ INCORRECT: Don't assign signals to variables
// const badCount = count; // This breaks reactivity!
// const badValue = count.value; // This doesn't track changes!
```

### Computed Values

Computed values automatically update when their dependencies change. They are lazy and only recalculate when accessed.

```tsx
import { signal, computed } from "react-understate";

const firstName = signal("John");
const lastName = signal("Doe");

// Create a computed signal
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

// Update dependencies - computed automatically updates
firstName.value = "Jane";
console.log(fullName.value); // "Jane Doe"

// Complex computed values with multiple dependencies
const count = signal(5);
const multiplier = signal(2);
const isEven = signal(true);

const result = computed(() => {
  const base = count.value * multiplier.value;
  return isEven.value ? base : base + 1;
});

console.log(result.value); // 10 (5 * 2 = 10, isEven = true)

isEven.value = false;
console.log(result.value); // 11 (5 * 2 = 10, isEven = false, so +1)
```

### Effects

Effects run side effects when their dependencies change. They automatically track which signals they depend on.

```tsx
import { signal, effect } from "react-understate";

const count = signal(0);
const name = signal("John");

// Simple effect that logs changes
const dispose = effect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

count.value = 5; // Logs: "Count: 5, Name: John"
name.value = "Jane"; // Logs: "Count: 5, Name: Jane"

// Clean up the effect
dispose();
```

#### Effects with Cleanup

Effects can return cleanup functions that run before the effect runs again or when disposed.

```tsx
import { signal, effect } from "react-understate";

const isVisible = signal(true);

const dispose = effect(() => {
  if (isVisible.value) {
    document.body.style.overflow = "hidden";

    // Return cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }
});

// Effect runs, body overflow is hidden

isVisible.value = false;
// Cleanup runs first (overflow restored to auto)
// Then effect runs again (no changes to overflow)

dispose(); // Final cleanup runs
```

#### Async Effects

Effects can be async and are commonly used for API calls:

```tsx
import { signal, effect } from "react-understate";

const userId = signal(1);
const userData = signal(null);
const loading = signal(false);

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

The `update` method provides a powerful way to update signals, especially for async operations. It includes built-in loading state management.

```tsx
import { signal } from "react-understate";

const count = signal(0);
const user = signal({ id: 1, name: "John" });

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

First, set the React instance for signal integration:

```tsx
import React from "react";
import { setReact } from "react-understate";

// Call this once at app startup
setReact(React);
```

### useSubscribe Hook

The `useSubscribe` hook subscribes to signal changes and triggers re-renders when signals update.

**Important:** The hook does NOT return a value. Access the signal's `.value` property directly in your component.

```tsx
import { signal, useSubscribe } from "react-understate";

const userCount = signal(0);
const userName = signal("Guest");

function UserDisplay() {
  // ✅ CORRECT: Use the hook to establish subscription
  useSubscribe(userCount);
  useSubscribe(userName);

  // Access signal values directly
  const count = userCount.value;
  const name = userName.value;

  return (
    <div>
      <h1>Welcome, {name}!</h1>
      <p>Active users: {count}</p>
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
import { signal, useSubscribe } from "react-understate";

const userData = signal(null);

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

Here's a more complex example with multiple signals and computed values:

```tsx
import { signal, computed, useSubscribe } from "react-understate";

// State
const todos = signal([]);
const filter = signal("all"); // 'all', 'active', 'completed'
const newTodo = signal("");

// Computed values
const filteredTodos = computed(() => {
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

const activeCount = computed(
  () => todos.value.filter((todo) => !todo.completed).length,
);

function TodoApp() {
  useSubscribe(todos);
  useSubscribe(filter);
  useSubscribe(newTodo);
  useSubscribe(filteredTodos);
  useSubscribe(activeCount);

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

Use `batch` to group multiple signal updates and trigger effects only once:

```tsx
import { signal, batch, effect } from "react-understate";

const firstName = signal("John");
const lastName = signal("Doe");
const age = signal(30);

// Effect that depends on multiple signals
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
const count = signal(0);
const isLoading = signal(false);

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
import { signal, computed, effect } from "react-understate";

// Base signals
const x = signal(0);
const y = signal(0);

// Computed coordinates
const position = computed(() => ({ x: x.value, y: y.value }));
const distance = computed(() => Math.sqrt(x.value ** 2 + y.value ** 2));

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
import { signal, computed } from "react-understate";

const email = signal("");
const password = signal("");
const confirmPassword = signal("");

const emailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
);

const passwordValid = computed(() => password.value.length >= 8);

const passwordsMatch = computed(() => password.value === confirmPassword.value);

const formValid = computed(
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

#### `signal<T>(initialValue: T): Signal<T>`

Creates a reactive signal with an initial value.

#### `computed<T>(computeFn: () => T): ReadonlySignal<T>`

Creates a read-only signal that automatically updates when dependencies change.

#### `effect(fn: () => void | (() => void)): () => void`

Runs a side effect that automatically re-executes when dependencies change. Returns a disposal function.

#### `batch(fn: () => void): void`

Batches multiple signal updates into a single effect flush.

### React Integration

#### `setReact(reactModule: any): void`

Sets the React instance for signal integration. Must be called once before using React features.

#### `useSubscribe<T>(signal: Signal<T>): void`

React hook to subscribe to signal changes and trigger re-renders.

### Signal Properties

#### `.value: T`

Gets or sets the signal value. Reading establishes a dependency, writing triggers updates.

#### `.rawValue: T`

Gets the signal value without establishing a dependency.

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
5. **Prefer computed over effects** - Use computed for derived state, effects for side effects
6. **Clean up effects** - Always call the disposal function when appropriate
7. **Use TypeScript** - Take advantage of full type safety

## License

MIT © [mjbeswick](https://github.com/mjbeswick)
