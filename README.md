# React Understate

The state management library that's so lightweight, it makes Redux feel like you're carrying a backpack full of bricks. No more wrestling with weight of useless boilerplate - just pure, unadulterated reactivity.

[![npm version](https://img.shields.io/npm/v/react-understate.svg)](https://www.npmjs.com/package/react-understate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🎯 **Simple API** - Just use `.value` to read/write state values
- ⚡ **Automatic dependency tracking** - Effects and derived values update automatically
- 🔄 **React 18+ integration** - Built with `useSyncExternalStore` for optimal performance
- 🚀 **Async support** - Built-in async update methods with loading states
- 💾 **State persistence** - Built-in localStorage/sessionStorage persistence with cross-tab sync
- 📦 **Lightweight** - Minimal bundle size with zero dependencies
- 🎨 **TypeScript first** - Full type safety out of the box
- ⚙️ **Batching support** - Optimize performance with batched updates
- 🧊 **TypeScript immutability** - Deep readonly types prevent mutations at compile time

## Installation

```bash
npm install react-understate
```

## Quick Start

**Basic usage with store pattern:**

```tsx
import { state, useUnderstate } from "react-understate";

// Create a store object
const store = {
  count: state(0),
  increment: () => store.count.value++,
};

function Counter() {
  const { count, increment } = useUnderstate(store);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

**With persistence:**

```tsx
import { state, useUnderstate, persistLocalStorage } from "react-understate";

const store = {
  count: state(0),
  increment: () => store.count.value++,
};

// Persist the count to localStorage
persistLocalStorage(store.count, "counter");

function Counter() {
  const { count, increment } = useUnderstate(store);
  return <button onClick={increment}>{count}</button>;
}
```

## Core Concepts

### States

States are reactive containers that hold values and notify subscribers when they change. Always use the `.value` property to read and write state values.

```tsx
import { state } from "react-understate";

const count = state(0);
console.log(count.value); // 0

count.value = 5;
console.log(count.value); // 5
```

### Derived Values

Derived values automatically update when their dependencies change:

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
```

### Effects

Effects run side effects when dependencies change:

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

### Async Updates

Use the `update` method for async operations with built-in loading states:

```tsx
import { state } from "react-understate";

const userData = state(null);

// Async update with loading state
const loadUser = async (id) => {
  await userData.update(async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
};

// Check loading state
if (userData.pending) {
  return <div>Loading...</div>;
}
```

### Batching Updates

Group multiple updates for better performance:

```tsx
import { state, batch } from "react-understate";

const firstName = state("John");
const lastName = state("Doe");
const age = state(30);

// Batch related updates
batch(() => {
  firstName.value = "Jane";
  lastName.value = "Smith";
  age.value = 25;
});
```

## React Integration

### useUnderstate Hook

The `useUnderstate` hook subscribes to state changes and re-renders components when values change:

```tsx
import { state, useUnderstate } from "react-understate";

const store = {
  count: state(0),
  increment: () => store.count.value++,
};

function Counter() {
  const { count, increment } = useUnderstate(store);
  return <button onClick={increment}>{count}</button>;
}
```

### Store Object Pattern

Organize related state and actions together:

```tsx
const todoStore = {
  // State
  todos: state<Todo[]>([]),
  filter: state<"all" | "active" | "completed">("all"),
  newTodo: state(""),

  // Computed values
  filteredTodos: derived(() => {
    switch (todoStore.filter.value) {
      case "active":
        return todoStore.todos.value.filter((todo) => !todo.completed);
      case "completed":
        return todoStore.todos.value.filter((todo) => todo.completed);
      default:
        return todoStore.todos.value;
    }
  }),

  // Actions
  addTodo: () => {
    if (todoStore.newTodo.value.trim()) {
      todoStore.todos.value = [
        ...todoStore.todos.value,
        {
          id: Date.now(),
          text: todoStore.newTodo.value.trim(),
          completed: false,
        },
      ];
      todoStore.newTodo.value = "";
    }
  },

  toggleTodo: (id: number) => {
    todoStore.todos.value = todoStore.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  },

  setFilter: (filter: typeof todoStore.filter.value) => {
    todoStore.filter.value = filter;
  },
};
```

## State Persistence

React Understate includes built-in persistence utilities that automatically save and restore state to browser storage.

### Basic Persistence

```tsx
import {
  state,
  persistLocalStorage,
  persistSessionStorage,
} from "react-understate";

// Persist to localStorage (survives browser restart)
const user = state({ name: "John", email: "john@example.com" });
persistLocalStorage(user, "user-data");

// Persist to sessionStorage (only for current session)
const theme = state("light");
persistSessionStorage(theme, "app-theme");
```

### Advanced Persistence

```tsx
import { state, persistStorage } from "react-understate";

const settings = state({
  notifications: true,
  language: "en",
  darkMode: false,
});

// Custom persistence with error handling
persistStorage(settings, "app-settings", localStorage, {
  serialize: (value) => JSON.stringify(value, null, 2),
  deserialize: (data) => JSON.parse(data),
  onError: (error) => console.error("Failed to persist settings:", error),
  loadInitial: true,
  syncAcrossTabs: true,
});
```

### Persisting Multiple States

```tsx
import { state, persistStates } from "react-understate";

const todos = state([]);
const filter = state("all");
const user = state(null);

// Persist all states at once
const dispose = persistStates(
  { todos, filter, user },
  "todo-app", // Key prefix: 'todo-app.todos', 'todo-app.filter', etc.
  localStorage,
);

// Later, clean up all persistence
dispose();
```

## Architecture & Best Practices

### Separation of Concerns

React Understate is designed to make it easy to completely separate business logic from the presentation layer:

```tsx
// ✅ GOOD - Business logic in store
const store = {
  // State
  user: state(null),
  loading: state(false),

  // Actions (business logic)
  login: async (email: string, password: string) => {
    store.loading.value = true;
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      store.user.value = await response.json();
    } finally {
      store.loading.value = false;
    }
  },

  logout: () => {
    store.user.value = null;
  },
};

// UI only calls actions
function LoginForm() {
  const { user, loading, login } = useUnderstate(store);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    login(formData.get("email"), formData.get("password"));
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

**Benefits:**

- **🧪 Easier Testing** - Business logic can be tested independently of React components
- **🔄 Better Reusability** - State logic can be shared across different UI frameworks
- **📦 Cleaner Components** - UI components focus purely on presentation
- **🛠️ Better Maintainability** - Business logic changes don't require touching UI code

### Testing Business Logic

Since business logic is separated from UI, you can test it independently:

```tsx
// test/store.test.ts
import { store } from "./store";

describe("Todo Store", () => {
  beforeEach(() => {
    store.todos.value = [];
    store.filter.value = "all";
  });

  it("should add todos", () => {
    store.addTodo("Learn React Understate");
    expect(store.todos.value).toHaveLength(1);
    expect(store.todos.value[0].text).toBe("Learn React Understate");
  });

  it("should toggle todo completion", () => {
    store.addTodo("Test todo");
    const todoId = store.todos.value[0].id;

    store.toggleTodo(todoId);
    expect(store.todos.value[0].completed).toBe(true);
  });
});
```

### Key Principles

1. **Create states at module level** - Never inside components
2. **Use store object pattern** - Group related state and actions together
3. **Separate business logic from UI** - Keep state and actions together, UI only calls actions
4. **Batch related updates** - Use `batch()` for multiple simultaneous updates
5. **Prefer derived over effects** - Use derived for computed state, effects for side effects
6. **Use object spread for updates** - Maintain immutability with object/array updates
7. **Handle errors in async updates** - Always wrap async operations in try-catch
8. **Use TypeScript** - Take advantage of full type safety and immutability

### TypeScript Support

```tsx
// TypeScript provides compile-time immutability
const user = state({ name: "John", age: 30 });
// user.value.name = 'Jane'; // TypeScript error: Cannot assign to 'name'

// Proper typing for complex state
type Todo = { id: number; text: string; completed: boolean };
const todos = state<Todo[]>([]);
```

## Examples

Check out the complete examples in the `examples/` directory:

- **Calculator** - Basic state management with derived values
- **Todo App** - Full-featured todo app with persistence

## API Reference

### Core Functions

- `state<T>(initialValue: T): State<T>` - Create a reactive state
- `derived<T>(fn: () => T): Derived<T>` - Create a derived value
- `effect(fn: () => void | (() => void)): () => void` - Create an effect
- `batch(fn: () => void): void` - Batch multiple updates

### React Integration

- `useUnderstate<T>(state: State<T>): [T]` - Subscribe to a single state
- `useUnderstate<T>(store: Store): T` - Subscribe to a store object

### Persistence

- `persistLocalStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`
- `persistSessionStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`
- `persistStorage<T>(state: State<T>, key: string, storage: Storage, options?: PersistOptions): () => void`
- `persistStates<T>(states: T, keyPrefix: string, storage?: Storage): () => void`

### Types

```tsx
type PersistOptions = {
  loadInitial?: boolean; // Load initial value from storage (default: true)
  syncAcrossTabs?: boolean; // Sync changes across tabs (default: true)
  serialize?: (value: T) => string; // Custom serializer (default: JSON.stringify)
  deserialize?: (value: string) => T; // Custom deserializer (default: JSON.parse)
  onError?: (error: Error) => void; // Error handler
};
```

## License

MIT © [mjbeswick](https://github.com/mjbeswick)

---

**Note**: This library is actively maintained and follows semantic versioning. For the latest updates and breaking changes, please check the [CHANGELOG.md](CHANGELOG.md).
