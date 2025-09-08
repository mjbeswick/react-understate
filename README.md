# React Understate

The state management library that's so lightweight, it makes Redux feel like you're carrying a backpack full of bricks. While Redux's predictable state management and time-travel debugging are legendary, React Understate cuts through the boilerplate to deliver pure, unadulterated reactivity with zero dependencies.

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
- 🎭 **Named reactive elements** - Give names to states, derived values, and effects for better debugging
- 🐛 **Debug logging** - Built-in debug system with configurable logging
- ⚡ **Action functions** - Automatic batching and debug logging for state updates

## Installation

```bash
npm install react-understate
```

## Quick Start

**Basic usage with store pattern:**

```tsx
import { state, useUnderstate } from 'react-understate';

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

## Core Concepts

### States

States are reactive containers that hold values and notify subscribers when they change. Always use the `.value` property to read and write state values.

```tsx
import { state } from 'react-understate';

const count = state(0);
console.log(count.value); // 0

count.value = 5;
console.log(count.value); // 5

// Update with function (sync)
count.value = prev => prev + 1;

// Update with async function
count.value = async prev => {
  const result = await fetch('/api/increment');
  return prev + (await result.json());
};
```

### Derived Values

Derived values automatically update when their dependencies change:

```tsx
import { state, derived } from 'react-understate';

const firstName = state('John');
const lastName = state('Doe');

// Create a derived state
const fullName = derived(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

// Update dependencies - derived automatically updates
firstName.value = 'Jane';
console.log(fullName.value); // "Jane Doe"
```

### Effects

Effects run side effects when dependencies change:

```tsx
import { state, effect } from 'react-understate';

const count = state(0);
const name = state('John');

// Simple effect that logs changes
effect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

count.value = 5; // Logs: "Count: 5, Name: John"
name.value = 'Jane'; // Logs: "Count: 5, Name: Jane"
```

### Async Updates

Use the `update` method for async operations with built-in loading states:

```tsx
import { state } from 'react-understate';

const userData = state(null);

// Async update with loading state
const loadUser = async id => {
  await userData.update(async () => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  });
};

// Handle loading state in your component
if (userData.value === null) {
  return <div>Loading...</div>;
}
```

### Actions

Actions are functions that automatically batch multiple state updates and provide better debugging:

```tsx
import { action, state } from 'react-understate';

const todos = state<Todo[]>([], 'todos');
const filter = state<'all' | 'active' | 'completed'>('all', 'filter');

const addTodo = action((text: string) => {
  todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
  filter.value = 'all'; // Reset filter when adding new todo
}, 'addTodo');

const toggleTodo = action((id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}, 'toggleTodo');

// Usage - all updates are automatically batched
addTodo('Learn React');
toggleTodo(1);
```

### Debugging

Enable debug logging to track state changes, derived value updates, effect runs, and action executions:

```tsx
import {
  configureDebug,
  state,
  derived,
  effect,
  action,
} from 'react-understate';

// Enable debug logging with file location links
configureDebug({ enabled: true, showFile: true });

// Create named reactive elements for better debugging
const count = state(0, 'counter');
const doubled = derived(() => count.value * 2, 'doubled');
const dispose = effect(() => {
  console.log(`Count is: ${count.value}`);
}, 'logCount');

const increment = action((amount: number) => {
  count.value = count.value + amount;
}, 'increment');

count.value = 5; // Logs: "state: 'counter' 5 /path/to/file.ts:123:45"
// Logs: "derived: 'doubled' 10 /path/to/file.ts:124:46"
// Logs: "effect: 'logCount' running /path/to/file.ts:125:47"

increment(3); // Logs: "action: 'increment' /path/to/file.ts:126:48"
// Logs: "state: 'counter' 8 /path/to/file.ts:127:49"
// Logs: "derived: 'doubled' 16 /path/to/file.ts:128:50"
// Logs: "effect: 'logCount' running /path/to/file.ts:129:51"
```

**Debug Options:**

- `enabled: boolean` - Enable/disable debug logging
- `logger: function` - Custom logger function (defaults to `console.log`)
- `showFile: boolean` - Show clickable file location links (defaults to `false`)

When `showFile: false` or omitted, logs show just the function names:

```tsx
configureDebug({ enabled: true });
// Logs: "action: 'increment'"
// Logs: "state: 'counter' 8"
// Logs: "derived: 'doubled' 16"
```

### Batching Updates

Group multiple updates for better performance:

```tsx
import { state, batch } from 'react-understate';

const firstName = state('John');
const lastName = state('Doe');
const age = state(30);

// Batch related updates
batch(() => {
  firstName.value = 'Jane';
  lastName.value = 'Smith';
  age.value = 25;
});
```

## React Integration

### useUnderstate Hook

The `useUnderstate` hook subscribes to state changes and re-renders components when values change:

```tsx
import { state, useUnderstate } from 'react-understate';

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
  filter: state<'all' | 'active' | 'completed'>('all'),
  newTodo: state(''),

  // Computed values
  filteredTodos: derived(() => {
    switch (todoStore.filter.value) {
      case 'active':
        return todoStore.todos.value.filter(todo => !todo.completed);
      case 'completed':
        return todoStore.todos.value.filter(todo => todo.completed);
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
      todoStore.newTodo.value = '';
    }
  },

  toggleTodo: (id: number) => {
    todoStore.todos.value = todoStore.todos.value.map(todo =>
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
} from 'react-understate';

// Persist to localStorage (survives browser restart)
const user = state({ name: 'John', email: 'john@example.com' });
persistLocalStorage(user, 'user-data');

// Persist to sessionStorage (only for current session)
const theme = state('light');
persistSessionStorage(theme, 'app-theme');
```

### Persisting Multiple States

```tsx
import { state, persistStates } from 'react-understate';

const todos = state([]);
const filter = state('all');
const user = state(null);

// Persist all states at once
const dispose = persistStates(
  { todos, filter, user },
  'todo-app', // Key prefix: 'todo-app.todos', 'todo-app.filter', etc.
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
      const response = await fetch('/api/login', {
        method: 'POST',
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
    login(formData.get('email'), formData.get('password'));
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
import { store } from './store';

describe('Todo Store', () => {
  beforeEach(() => {
    store.todos.value = [];
    store.filter.value = 'all';
  });

  it('should add todos', () => {
    store.addTodo('Learn React Understate');
    expect(store.todos.value).toHaveLength(1);
    expect(store.todos.value[0].text).toBe('Learn React Understate');
  });

  it('should toggle todo completion', () => {
    store.addTodo('Test todo');
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
const user = state({ name: 'John', age: 30 });
// user.value.name = 'Jane'; // TypeScript error: Cannot assign to 'name'

// Proper typing for complex state
type Todo = { id: number; text: string; completed: boolean };
const todos = state<Todo[]>([]);
```

## Recommended Pattern: Functional Store Architecture

The todo example demonstrates the recommended pattern for organizing React Understate applications. This approach provides excellent separation of concerns, testability, and maintainability.

### Pattern Overview

```tsx
// 1. Define types
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

// 2. Create state variables
const todos = state<Todo[]>([]);
const filter = state<'all' | 'active' | 'completed'>('all');
const newTodo = state('');

// 3. Add persistence
persistLocalStorage(todos, 'todos');
persistLocalStorage(filter, 'todos-filter');

// 4. Create computed values
export const filteredTodos = derived(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
});

// 5. Define action functions
function addTodo() {
  if (newTodo.value.trim()) {
    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: newTodo.value.trim(),
        completed: false,
      },
    ];
    newTodo.value = '';
  }
}

function toggleTodo(id: number) {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}

// 6. Export everything
export {
  todos,
  filter,
  newTodo,
  addTodo,
  toggleTodo,
  // ... other exports
};
```

### Component Example

```tsx
function TodoApp() {
  const { todos, newTodo, addTodo, toggleTodo } = useUnderstate({
    todos,
    newTodo,
    addTodo,
    toggleTodo,
  });
}

return <div>{/* Clean, simple component logic */}</div>;
```

### Why This Pattern Works

**🎯 Clear Separation of Concerns**

- **State**: Raw reactive values
- **Computed**: Derived values that automatically update
- **Actions**: Pure functions that modify state
- **Persistence**: Declarative storage configuration

**🧪 Excellent Testability**

```tsx
// Test actions independently
describe('Todo Actions', () => {
  beforeEach(() => {
    todos.value = [];
    newTodo.value = '';
  });

  it('should add a todo', () => {
    newTodo.value = 'Test todo';
    addTodo();
    expect(todos.value).toHaveLength(1);
    expect(todos.value[0].text).toBe('Test todo');
  });
});
```

**🔄 Easy Component Integration**

```tsx
function TodoApp() {
  const { todos, newTodo, addTodo, toggleTodo } = useUnderstate({
    todos,
    newTodo,
    addTodo,
    toggleTodo,
  });

  return <div>{/* Clean, simple component logic */}</div>;
}
```

**📦 Perfect Tree-Shaking**

- Import only what you need
- Unused actions are eliminated from the bundle
- Computed values are only created when used

**🛠️ Maintainable Architecture**

- Easy to add new features
- Clear data flow
- Predictable state updates
- Type-safe throughout

### Pattern Benefits

| Aspect          | Benefit                                     |
| --------------- | ------------------------------------------- |
| **Testing**     | Actions can be tested without React         |
| **Reusability** | Logic works in any framework                |
| **Performance** | Only used code is bundled                   |
| **Type Safety** | Full TypeScript support                     |
| **Debugging**   | Clear separation makes issues easy to trace |
| **Scaling**     | Pattern scales from simple to complex apps  |

This pattern is used in both the [Calculator](examples/calculator/) and [Todo App](examples/todo-app/) examples, demonstrating its versatility across different application types.

## Examples

Check out the complete examples in the `examples/` directory:

- **Calculator** - Basic state management with derived values
- **Todo App** - Full-featured todo app with persistence

## API Reference

### Core Functions

- `state<T>(initialValue: T, name?: string): State<T>` - Create a reactive state
- `derived<T>(fn: () => T, name?: string): Derived<T>` - Create a derived value
- `effect(fn: () => void | (() => void), name?: string): () => void` - Create an effect
- `batch(fn: () => void): void` - Batch multiple updates
- `action<T extends any[]>(fn: (...args: T) => void, name?: string): (...args: T) => void` - Create an action function

### React Integration

- `useUnderstate<T>(state: State<T>): [T]` - Subscribe to a single state
- `useUnderstate<T>(store: Store): T` - Subscribe to a store object

### Persistence

- `persistLocalStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`
- `persistSessionStorage<T>(state: State<T>, key: string, options?: PersistOptions): () => void`
- `persistStates<T>(states: T, keyPrefix: string, storage?: Storage): () => void`

### Debug Configuration

- `configureDebug(options?: { enabled?: boolean; logger?: (message: string) => void; showFile?: boolean }): { enabled: boolean; logger?: (message: string) => void; showFile: boolean }` - Configure debug logging or get current configuration

### Browser Debugging

In development, you can access the debug API and all named states through the browser console:

```tsx
// Access debug configuration
window.understate.configureDebug({ enabled: true, showFile: true });

// Access all named states
console.log(window.understate.states);
// { count: State<number>, user: State<User>, ... }

// Inspect a specific state
console.log(window.understate.states.count.value);
// 42

// Update a state from the console
window.understate.states.count.value = 100;
```

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
