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

**Simple atomic state:**

```tsx
import { state, useUnderstate } from "react-understate";

// Create a state
const count = state(0);

function Counter() {
  // Subscribe to state changes and get current value
  const [countValue] = useUnderstate(count);

  return (
    <div>
      <p>Count: {countValue}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

**Store object pattern:**

```tsx
import { state, useUnderstate } from "react-understate";

// Create a store object
// in practive this would be the "* as store" exports from your store file
const store = {
  count: state(0),
  increment: () => store.count.value++,
};

function Counter() {
  // Get current values and functions from store
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

// Create a store object with persistence
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

## Philosophy & Architecture

React Understate is designed to make it easy to completely separate business logic from the presentation layer. This architectural approach provides several key benefits:

- **🧪 Easier Testing** - Business logic can be tested independently of React components
- **🔄 Better Reusability** - State logic can be shared across different UI frameworks
- **📦 Cleaner Components** - UI components focus purely on presentation
- **🛠️ Better Maintainability** - Business logic changes don't require touching UI code

### Recommended Architecture

**Construct state atomically** and update it through dedicated action functions, similar to Redux actions:

```tsx
// ✅ GOOD - Atomic state construction with action functions
const store = {
  // State (data)
  todos: state<Todo[]>([]),
  filter: state<"all" | "active" | "completed">("all"),
  loading: state(false),

  // Actions (business logic)
  addTodo: (text: string) => {
    if (text.trim()) {
      store.todos.value = [
        ...store.todos.value,
        { id: Date.now(), text: text.trim(), completed: false },
      ];
    }
  },

  toggleTodo: (id: number) => {
    store.todos.value = store.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  },

  setFilter: (filter: typeof store.filter.value) => {
    store.filter.value = filter;
  },

  loadTodos: async () => {
    store.loading.value = true;
    try {
      const response = await fetch("/api/todos");
      store.todos.value = await response.json();
    } finally {
      store.loading.value = false;
    }
  },
};

// UI components only call actions
function TodoApp() {
  const { todos, filter, loading, addTodo, toggleTodo, setFilter, loadTodos } =
    useUnderstate(store);

  return (
    <div>
      <button onClick={loadTodos}>Load Todos</button>
      {/* UI implementation */}
    </div>
  );
}
```

**Benefits of this approach:**

- **Testable** - You can test `addTodo`, `toggleTodo`, etc. without React
- **Reusable** - The same store can work with Vue, Angular, or vanilla JS
- **Predictable** - State changes happen through well-defined actions
- **Debuggable** - Easy to trace state changes and add logging

### Testing Business Logic

Since business logic is separated from UI, you can test it independently:

```tsx
// test/store.test.ts
import { store } from "./store";

describe("Todo Store", () => {
  beforeEach(() => {
    // Reset state before each test
    store.todos.value = [];
    store.filter.value = "all";
  });

  it("should add todos", () => {
    store.addTodo("Learn React Understate");

    expect(store.todos.value).toHaveLength(1);
    expect(store.todos.value[0].text).toBe("Learn React Understate");
    expect(store.todos.value[0].completed).toBe(false);
  });

  it("should toggle todo completion", () => {
    store.addTodo("Test todo");
    const todoId = store.todos.value[0].id;

    store.toggleTodo(todoId);
    expect(store.todos.value[0].completed).toBe(true);

    store.toggleTodo(todoId);
    expect(store.todos.value[0].completed).toBe(false);
  });

  it("should filter todos correctly", () => {
    store.addTodo("Active todo");
    store.addTodo("Completed todo");
    store.toggleTodo(store.todos.value[1].id); // Mark second as completed

    store.setFilter("active");
    expect(store.filteredTodos.value).toHaveLength(1);
    expect(store.filteredTodos.value[0].text).toBe("Active todo");
  });
});
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

### TypeScript Immutability

React Understate uses TypeScript's type system to enforce immutability at compile time. All state values are wrapped in `DeepReadonly<T>` types, making all properties and nested properties readonly. This prevents mutations during development while maintaining zero runtime overhead.

```tsx
const user = state({ name: 'John', age: 30 });
const items = state(['apple', 'banana']);

// ✅ CORRECT: Create new objects/arrays for updates
user.value = { ...user.value, age: 31 };
items.value = [...items.value, 'cherry'];

// ❌ INCORRECT: Direct mutations will cause TypeScript errors
// user.value.name = 'Jane'; // TypeScript error: Cannot assign to 'name' because it is a read-only property
// items.value.push('cherry'); // TypeScript error: Property 'push' does not exist on type 'readonly string[]'

// Deep readonly works recursively
const nested = state({
  user: {
    profile: {
      preferences: { theme: 'dark' }
    }
  }
});

// All nested properties are readonly
// nested.value.user.profile.preferences.theme = 'light'; // TypeScript error: Cannot assign to 'theme'
````

**Benefits of TypeScript Immutability:**

- **Zero Runtime Cost**: No performance overhead from freezing
- **Compile-time Safety**: Catches mutations during development
- **Better Performance**: No recursive freezing operations
- **Type Safety**: Full TypeScript support with proper readonly types
- **Developer Experience**: Clear error messages when attempting mutations

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

**No setup required!** React is automatically detected in all environments, just like Redux. The `useUnderstate` hook works out of the box with zero configuration.

The library automatically detects React when first used, working seamlessly with:

- Vite
- Webpack
- Create React App
- Next.js
- And any other modern bundler

The library automatically works with React 18+ using `use-sync-external-store/shim` for optimal compatibility.

### useUnderstate Hook

The `useUnderstate` hook subscribes to state changes and triggers re-renders when states update.

**Important:** The hook supports two patterns. The store object pattern is preferred for better organization and ergonomics.

```tsx
import { state, useUnderstate } from "react-understate";

// ✅ PREFERRED: Store object pattern
const store = {
  userCount: state(0),
  userName: state("Guest"),
  addUser: () => store.userCount.value++,
  setName: (name: string) => (store.userName.value = name),
};

function UserDisplay() {
  // Get current values and functions from store
  const { userCount, userName, addUser, setName } = useUnderstate(store);

  return (
    <div>
      <h1>Welcome, {userName}!</h1>
      <p>Active users: {userCount}</p>
      <button onClick={addUser}>Add User</button>
      <button onClick={() => setName("John")}>Set Name to John</button>
    </div>
  );
}
```

#### Alternative: Array Pattern

You can also use the array pattern for individual states:

```tsx
import { state, useUnderstate } from "react-understate";

const userCount = state(0);
const userName = state("Guest");

function UserDisplay() {
  // Array pattern - returns array of values
  const [count, name] = useUnderstate(userCount, userName);

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

**Why prefer the store object pattern?**

- **Better organization**: Groups related state and actions together
- **Cleaner components**: No need to access `.value` properties
- **Type safety**: Full TypeScript support with proper inference
- **Easier refactoring**: Actions are co-located with their state
- **Better performance**: Single subscription to the entire store

### Loading States in React

Use the `pending` property to show loading states during async updates:

```tsx
import { state, useUnderstate } from "react-understate";

const userData = state(null);

function UserProfile({ userId }) {
  const [data] = useUnderstate(userData);

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

      {data && (
        <div>
          <h2>{data.name}</h2>
          <p>{data.email}</p>
        </div>
      )}
    </div>
  );
}
```

### Complex React Example

Here's a more complex example with multiple signals and derived values:

```tsx
import { state, derived, useUnderstate } from "react-understate";

// Create store with state and actions
const store = {
  // State
  todos: state([]),
  filter: state("all"), // 'all', 'active', 'completed'
  newTodo: state(""),

  // Computed values
  filteredTodos: derived(() => {
    switch (store.filter.value) {
      case "active":
        return store.todos.value.filter((todo) => !todo.completed);
      case "completed":
        return store.todos.value.filter((todo) => todo.completed);
      default:
        return store.todos.value;
    }
  }),

  activeCount: derived(
    () => store.todos.value.filter((todo) => !todo.completed).length,
  ),

  // Actions
  addTodo: () => {
    if (store.newTodo.value.trim()) {
      store.todos.value = [
        ...store.todos.value,
        {
          id: Date.now(),
          text: store.newTodo.value.trim(),
          completed: false,
        },
      ];
      store.newTodo.value = "";
    }
  },

  toggleTodo: (id: number) => {
    store.todos.value = store.todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  },

  removeTodo: (id: number) => {
    store.todos.value = store.todos.value.filter((todo) => todo.id !== id);
  },

  setFilter: (filter: string) => {
    store.filter.value = filter;
  },

  setNewTodo: (text: string) => {
    store.newTodo.value = text;
  },
};

function TodoApp() {
  const {
    todos,
    filter,
    newTodo,
    filteredTodos,
    activeCount,
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    setNewTodo,
  } = useUnderstate(store);

  return (
    <div>
      <h1>Todo App</h1>

      <div>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a todo..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <div>
        <button
          onClick={() => setFilter("all")}
          style={{ fontWeight: filter === "all" ? "bold" : "normal" }}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          style={{ fontWeight: filter === "active" ? "bold" : "normal" }}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter("completed")}
          style={{
            fontWeight: filter === "completed" ? "bold" : "normal",
          }}
        >
          Completed
        </button>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
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
import { state, derived, useUnderstate } from "react-understate";

// Create form store
const formStore = {
  email: state(""),
  password: state(""),
  confirmPassword: state(""),

  emailValid: derived(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formStore.email.value),
  ),

  passwordValid: derived(() => formStore.password.value.length >= 8),

  passwordsMatch: derived(
    () => formStore.password.value === formStore.confirmPassword.value,
  ),

  formValid: derived(
    () =>
      formStore.emailValid.value &&
      formStore.passwordValid.value &&
      formStore.passwordsMatch.value,
  ),

  setEmail: (email: string) => {
    formStore.email.value = email;
  },

  setPassword: (password: string) => {
    formStore.password.value = password;
  },

  setConfirmPassword: (password: string) => {
    formStore.confirmPassword.value = password;
  },
};

function SignupForm() {
  const {
    email,
    password,
    confirmPassword,
    emailValid,
    passwordValid,
    passwordsMatch,
    formValid,
    setEmail,
    setPassword,
    setConfirmPassword,
  } = useUnderstate(formStore);

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {!emailValid && email && <p>Please enter a valid email</p>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {!passwordValid && password && (
        <p>Password must be at least 8 characters</p>
      )}

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
      />
      {!passwordsMatch && confirmPassword && <p>Passwords do not match</p>}

      <button type="submit" disabled={!formValid}>
        Sign Up
      </button>
    </form>
  );
}
```

## State Persistence

React Understate includes built-in persistence utilities that automatically save and restore state to browser storage. This makes it easy to create apps that remember user data across sessions.

### Basic Persistence

The simplest way to persist state is using `persistLocalStorage` or `persistSessionStorage`:

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

### Advanced Persistence Options

For more control, use the generic `persistStorage` function:

```tsx
import { state, persistStorage } from "react-understate";

const settings = state({
  notifications: true,
  language: "en",
  darkMode: false,
});

// Custom persistence with error handling
persistStorage(settings, "app-settings", localStorage, {
  serialize: (value) => JSON.stringify(value, null, 2), // Pretty print
  deserialize: (data) => JSON.parse(data),
  onError: (error) => console.error("Failed to persist settings:", error),
  loadInitial: true, // Load from storage on first call
  syncAcrossTabs: true, // Sync changes across browser tabs
});
```

### Persisting Multiple States

Use `persistStates` to persist multiple states with a single key prefix:

```tsx
import { state, persistStates } from "react-understate";

// Create your states
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

### Cross-Tab Synchronization

Changes automatically sync across browser tabs when using localStorage or sessionStorage:

```tsx
// Tab 1
const count = state(0);
persistLocalStorage(count, "counter");
count.value = 42; // This will sync to other tabs

// Tab 2 (same page)
const count = state(0);
persistLocalStorage(count, "counter");
// count.value will automatically become 42
```

### Custom Storage Implementation

You can persist to any storage that implements the Storage interface:

```tsx
// Custom storage implementation
class CustomStorage implements Storage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  get length(): number {
    return this.data.size;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] || null;
  }
}

// Use custom storage
const customStorage = new CustomStorage();
const data = state({ message: "Hello" });
persistStorage(data, "custom-key", customStorage);
```

### Error Handling

All persistence functions include built-in error handling:

```tsx
const user = state({ name: "John" });

persistLocalStorage(user, "user", {
  onError: (error) => {
    console.error("Persistence failed:", error);
    // Handle error (e.g., show user notification, fallback to memory)
  },
});
```

### Server-Side Rendering (SSR) Support

Persistence functions are SSR-safe and will gracefully handle missing storage:

```tsx
// This works in both browser and Node.js environments
const data = state({ value: "default" });
persistLocalStorage(data, "key"); // No errors in SSR
```

### Complete Example: Persistent Todo App

Here's a complete example showing how to build a persistent todo app:

```tsx
import {
  state,
  derived,
  useUnderstate,
  persistLocalStorage,
} from "react-understate";

// Define types
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

// Create states
const todos = state<Todo[]>([]);
const filter = state<"all" | "active" | "completed">("all");
const newTodo = state("");

// Persist important state
persistLocalStorage(todos, "todos");
persistLocalStorage(filter, "todos-filter");
// Note: We don't persist newTodo as it's temporary input

// Derived values
const filteredTodos = derived(() => {
  switch (filter.value) {
    case "active":
      return todos.value.filter((todo) => !todo.completed);
    case "completed":
      return todos.value.filter((todo) => todo.completed);
    default:
      return todos.value;
  }
});

const activeCount = derived(
  () => todos.value.filter((todo) => !todo.completed).length,
);

// Actions
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

const toggleTodo = (id: number) => {
  todos.value = todos.value.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
};

const removeTodo = (id: number) => {
  todos.value = todos.value.filter((todo) => todo.id !== id);
};

const setFilter = (newFilter: typeof filter.value) => {
  filter.value = newFilter;
};

// Export store
export const store = {
  todos,
  filter,
  newTodo,
  filteredTodos,
  activeCount,
  addTodo,
  toggleTodo,
  removeTodo,
  setFilter,
};
```

### Persistence API Reference

#### `persistLocalStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`

Persists state to localStorage with cross-tab synchronization.

#### `persistSessionStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`

Persists state to sessionStorage with cross-tab synchronization.

#### `persistStorage<T>(state: State<T>, key: string, storage: Storage, options?: PersistOptions): () => void`

Generic persistence function for any storage implementation.

#### `persistStates<T>(states: T, keyPrefix: string, storage?: Storage): () => void`

Persists multiple states with a single key prefix.

#### PersistOptions

```tsx
type PersistOptions = {
  loadInitial?: boolean; // Load initial value from storage (default: true)
  syncAcrossTabs?: boolean; // Sync changes across tabs (default: true)
  serialize?: (value: T) => string; // Custom serializer (default: JSON.stringify)
  deserialize?: (value: string) => T; // Custom deserializer (default: JSON.parse)
  onError?: (error: Error) => void; // Error handler
};
```

## API Reference

### Core Functions

#### `state<T>(initialValue: T): State<T>`

Creates a reactive state with an initial value.

#### `derived<T>(computeFn: () => T): State<T>`

Creates a read-only state that automatically updates when dependencies change.

#### `effect(fn: () => void | (() => void)): () => void`

Runs a side effect that automatically re-executes when dependencies change. Returns a disposal function.

#### `batch(fn: () => void): void`

Batches multiple state updates into a single effect flush.

### React Integration

#### `useUnderstate<T extends readonly State<unknown>[]>(...signals: T): { [K in keyof T]: T[K] extends State<infer U> ? U : never }`

React hook to subscribe to state changes and trigger re-renders. Returns an array of current state values.

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

## ESLint Plugin

Use the official ESLint plugin to enforce best practices: eslint-plugin-react-understate (`https://www.npmjs.com/package/eslint-plugin-react-understate`).

## Best Practices

### Core Principles

1. **Always use `.value`** - Never assign signals to variables for storage

   ```tsx
   // ✅ CORRECT
   const count = state(0);
   console.log(count.value); // 0
   count.value = 42;

   // ❌ INCORRECT - breaks reactivity
   const badCount = count; // Don't do this!
   const badValue = count.value; // This doesn't track changes!
   ```

2. **Create signals at module level** - Don't create signals inside components

   ```tsx
   // ✅ CORRECT - at module level
   const userStore = {
     name: state(""),
     email: state(""),
     setName: (name: string) => (userStore.name.value = name),
   };

   function UserComponent() {
     const { name, setName } = useUnderstate(userStore);
     return <input value={name} onChange={(e) => setName(e.target.value)} />;
   }

   // ❌ INCORRECT - inside component
   function BadComponent() {
     const count = state(0); // Creates new signal on every render!
     return <div>{count.value}</div>;
   }
   ```

3. **Use the store object pattern** - Prefer `useUnderstate(store)` over individual signals

   ```tsx
   // ✅ PREFERRED - store object pattern
   const store = {
     count: state(0),
     increment: () => store.count.value++,
   };

   function Counter() {
     const { count, increment } = useUnderstate(store);
     return <button onClick={increment}>{count}</button>;
   }

   // ⚠️ ACCEPTABLE - but less ergonomic
   const count = state(0);
   function Counter() {
     const [countValue] = useUnderstate(count);
     return <button onClick={() => count.value++}>{countValue}</button>;
   }
   ```

4. **Separate business logic from UI** - Keep state and actions together, UI only calls actions

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

   // ❌ BAD - Business logic mixed with UI
   function BadLoginForm() {
     const user = state(null);
     const loading = state(false);

     const handleSubmit = async (e: FormEvent) => {
       // Business logic in component - hard to test!
       loading.value = true;
       try {
         const response = await fetch("/api/login", {
           /* ... */
         });
         user.value = await response.json();
       } finally {
         loading.value = false;
       }
     };
   }
   ```

### Performance Optimization

5. **Batch related updates** - Use `batch()` for multiple simultaneous updates

   ```tsx
   const firstName = state("John");
   const lastName = state("Doe");
   const age = state(30);

   // ❌ INEFFICIENT - triggers 3 separate updates
   firstName.value = "Jane";
   lastName.value = "Smith";
   age.value = 25;

   // ✅ EFFICIENT - single update cycle
   batch(() => {
     firstName.value = "Jane";
     lastName.value = "Smith";
     age.value = 25;
   });
   ```

6. **Prefer derived over effects** - Use derived for computed state, effects for side effects

   ```tsx
   const firstName = state("John");
   const lastName = state("Doe");

   // ✅ CORRECT - derived for computed values
   const fullName = derived(() => `${firstName.value} ${lastName.value}`);

   // ✅ CORRECT - effects for side effects
   effect(() => {
     document.title = `Welcome, ${fullName.value}!`;
   });

   // ❌ INCORRECT - using effect for computed state
   const badFullName = state("");
   effect(() => {
     badFullName.value = `${firstName.value} ${lastName.value}`;
   });
   ```

7. **Use object spread for updates** - Maintain immutability with object/array updates

   ```tsx
   const user = state({ name: "John", age: 30 });
   const items = state(["apple", "banana"]);

   // ✅ CORRECT - immutable updates
   user.value = { ...user.value, age: 31 };
   items.value = [...items.value, "cherry"];

   // ❌ INCORRECT - direct mutations (TypeScript will catch these)
   // user.value.age = 31; // TypeScript error!
   // items.value.push('cherry'); // TypeScript error!
   ```

### Async Operations

8. **Use the `update` method for async operations** - Built-in loading state management

   ```tsx
   const userData = state(null);

   // ✅ CORRECT - async update with loading state
   const loadUser = async (id: number) => {
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

9. **Handle errors in async updates** - Always wrap async operations in try-catch

   ```tsx
   const data = state(null);
   const error = state(null);

   const fetchData = async () => {
     try {
       await data.update(async () => {
         const response = await fetch("/api/data");
         if (!response.ok) throw new Error("Failed to fetch");
         return response.json();
       });
       error.value = null; // Clear previous errors
     } catch (err) {
       error.value = err.message;
     }
   };
   ```

### React Integration

10. **Clean up effects when needed** - Always call the disposal function for long-lived effects

```tsx
useEffect(() => {
  const dispose = effect(() => {
    // Effect logic here
  });

  return dispose; // Cleanup on unmount
}, []);
```

11. **Use loading states in React** - Leverage the `pending` property for better UX

    ```tsx
    function UserProfile() {
      const [userData] = useUnderstate(userDataState);

      return (
        <div>
          {userDataState.pending && <div>Loading...</div>}
          {userData && <div>{userData.name}</div>}
        </div>
      );
    }
    ```

### Development & Maintenance

12. **Use TypeScript** - Take advantage of full type safety and immutability

    ```tsx
    // ✅ TypeScript provides compile-time immutability
    const user = state({ name: "John", age: 30 });
    // user.value.name = 'Jane'; // TypeScript error: Cannot assign to 'name'

    // ✅ Proper typing for complex state
    type Todo = { id: number; text: string; completed: boolean };
    const todos = state<Todo[]>([]);
    ```

13. **Use the ESLint plugin** - Catch issues early and enforce best practices

    ```bash
    npm install --save-dev eslint-plugin-react-understate
    ```

    ```js
    // eslint.config.js
    export default [
      {
        plugins: {
          "react-understate": require("eslint-plugin-react-understate"),
        },
        rules: {
          "react-understate/require-use-subscribe": "error",
          "react-understate/no-direct-state-assignment": "error",
          "react-understate/prefer-batch-for-multiple-updates": "warn",
        },
      },
    ];
    ```

### Architecture Patterns

14. **Organize stores by feature** - Group related state and actions together

    ```tsx
    // ✅ GOOD - feature-based organization
    // stores/user.ts
    export const userStore = {
      profile: state(null),
      preferences: state({ theme: "light" }),
      updateProfile: (profile) => (userStore.profile.value = profile),
      setTheme: (theme) =>
        (userStore.preferences.value = {
          ...userStore.preferences.value,
          theme,
        }),
    };

    // stores/todos.ts
    export const todoStore = {
      items: state([]),
      filter: state("all"),
      addTodo: (text) => {
        /* ... */
      },
      toggleTodo: (id) => {
        /* ... */
      },
    };
    ```

15. **Use derived values for computed state** - Keep your state minimal and derive what you need

    ```tsx
    const todos = state([]);
    const filter = state("all");

    // ✅ GOOD - derived computed values
    const filteredTodos = derived(() => {
      switch (filter.value) {
        case "active":
          return todos.value.filter((t) => !t.completed);
        case "completed":
          return todos.value.filter((t) => t.completed);
        default:
          return todos.value;
      }
    });

    const activeCount = derived(
      () => todos.value.filter((t) => !t.completed).length,
    );
    ```

16. **Avoid nested effects and derived values** - Keep your dependency graph flat

    ```tsx
    // ❌ AVOID - nested derived values
    const a = state(1);
    const b = derived(() => a.value * 2);
    const c = derived(() => b.value * 3); // Nested dependency

    // ✅ PREFER - flat dependency graph
    const a = state(1);
    const b = derived(() => a.value * 2);
    const c = derived(() => a.value * 6); // Direct dependency
    ```

## License

MIT © [mjbeswick](https://github.com/mjbeswick)

---

**Note**: This library is actively maintained and follows semantic versioning. For the latest updates and breaking changes, please check the [CHANGELOG.md](CHANGELOG.md).
