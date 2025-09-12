# React Understate

The state management library that's so lightweight, it makes Redux feel like you're carrying a backpack full of bricks. While Redux's predictable state management and time-travel debugging are legendary, React Understate cuts through the boilerplate to deliver pure, unadulterated reactivity with zero dependencies.

[![npm version](https://img.shields.io/npm/v/react-understate.svg)](https://www.npmjs.com/package/react-understate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## Features

- 🎯 **Simple API** - Just use `.value` to read/write state values
- ⚡ **Automatic dependency tracking** - Effects and derived values update automatically
- 🔄 **React 18+ integration** - Built with `useSyncExternalStore` for optimal performance
- 🚀 **Async support** - Built-in async update methods and async setters with loading states
- 💾 **State persistence** - Built-in localStorage/sessionStorage persistence with cross-tab sync
- 📦 **Lightweight** - Minimal bundle size with zero dependencies
- 🎨 **TypeScript first** - Full type safety out of the box
- ⚙️ **Batching support** - Optimize performance with batched updates
- 🧊 **TypeScript immutability** - Deep readonly types prevent mutations at compile time
- 🎭 **Named reactive elements** - Give names to states, derived values, and effects for better debugging
- 🐛 **Debug logging** - Built-in debug system with configurable logging
- ⚡ **Action functions** - Automatic batching and debug logging for state updates
- 🔧 **ESLint integration** - Built-in ESLint rules for best practices and state name validation

## Installation

```bash
npm install react-understate
```

### ESLint Integration (Optional)

For additional code quality and best practices, install the ESLint plugin:

```bash
npm install --save-dev eslint-plugin-react-understate
```

Then add it to your ESLint configuration:

```js
// eslint.config.js
import reactUnderstate from 'eslint-plugin-react-understate';

export default [
  // ... other configs
  {
    plugins: {
      'react-understate': reactUnderstate,
    },
    rules: {
      ...reactUnderstate.configs.recommended.rules,
    },
  },
];
```

**Available Rules:**

- `require-valid-state-name` - Ensures state names are valid JavaScript identifiers
- `no-nested-understate-functions` - Prevents any understate function calls inside other understate functions
- `no-batch-in-effects` - Prevents redundant batch() calls inside effects (effects auto-batch)
- `prefer-derived-for-computed` - Suggests using derived values for computed state
- `prefer-effect-for-side-effects` - Suggests using effects for side effects
- And many more best practice rules...

## Quick Start

**Basic usage with store pattern:**

```tsx
import { state, useUnderstate, action } from 'react-understate';

// Create a store object
const store = {
  count: state(0),
  increment: action(() => {
    store.count.value++;
  }, 'increment'),
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

States are reactive containers that hold values and notify subscribers when they change. Always use the `.value` property to read state values. For updates, prefer using actions, but direct assignment is acceptable for simple cases.

```tsx
import { state, action } from 'react-understate';

const count = state(0);
console.log(count.value); // 0

// Use actions for state updates
const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

const increment = action((amount: number) => {
  count.value = prev => prev + amount;
}, 'increment');

const asyncIncrement = action(async (amount: number) => {
  await new Promise(resolve => setTimeout(resolve, 100));
  count.value = prev => prev + amount;
}, 'asyncIncrement');

// Call actions instead of direct assignment
setCount(5);
console.log(count.value); // 5
```

**Required Value Property:**

For states that may be null or undefined, use the `.requiredValue` property for runtime-safe non-null assertions:

```tsx
const user = state<User | null>(null);

// After ensuring user is loaded
if (user.value) {
  // TypeScript knows user.value is User | null
  console.log(user.value.name); // Type error: name might not exist

  // Use non-null assertion when you know it's safe
  console.log(user.value!.name); // Works, but no runtime safety

  // Or use the requiredValue property for runtime safety
  console.log(user.requiredValue.name); // Works with runtime check
}

// The requiredValue getter throws if the value is null/undefined
try {
  const name = user.requiredValue.name; // Throws: "Required value is null"
} catch (error) {
  console.log('User not loaded yet');
}

// The requiredValue setter prevents setting null/undefined
user.requiredValue = { id: 1, name: 'John' }; // Works
user.requiredValue = null; // Throws: "Cannot set required value to null"

// Named states include the name in error messages for better debugging
const userState = state<User | null>(null, 'userState');
userState.requiredValue; // Throws: "Required value 'userState' is null"
userState.requiredValue = null; // Throws: "Cannot set required value 'userState' to null"
```

### Derived Values

Derived values automatically update when their dependencies change:

```tsx
import { state, derived, action } from 'react-understate';

const firstName = state('John');
const lastName = state('Doe');

// Create a derived state
const fullName = derived(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

// Update dependencies - derived automatically updates
const setFirstName = action((name: string) => {
  firstName.value = name;
}, 'setFirstName');

setFirstName('Jane');
console.log(fullName.value); // "Jane Doe"
```

### Effects

Effects run side effects when dependencies change. You can control effect behavior with options:

```tsx
import { state, effect, action } from 'react-understate';

const count = state(0);
const name = state('John');

// Simple effect that logs changes
effect(() => {
  console.log(`Count: ${count.value}, Name: ${name.value}`);
});

// Effect with options
effect(
  () => {
    console.log('This runs only once');
  },
  'oneTimeEffect',
  { once: true },
);

// Effect that prevents overlapping executions
effect(
  async () => {
    await fetch('/api/data');
    console.log('API call completed');
  },
  'apiEffect',
  { preventOverlap: true },
);

// Effect that prevents infinite loops (default behavior)
effect(
  () => {
    count.value = count.value + 1; // Won't cause infinite loop
  },
  'safeEffect',
  { preventLoops: true },
);

const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

const setName = action((value: string) => {
  name.value = value;
}, 'setName');

setCount(5); // Logs: "Count: 5, Name: John"
setName('Jane'); // Logs: "Count: 5, Name: Jane"
```

**Effect Options:**

- `once: boolean` - Run effect only once, ignore subsequent dependency changes
- `preventOverlap: boolean` - Prevent overlapping executions of async effects
- `preventLoops: boolean` - Automatically prevent infinite loops (default: true)

**Automatic Batching:**

Effects automatically batch state updates to prevent infinite loops and improve performance. Multiple state updates within an effect are collected and processed together:

```tsx
effect(() => {
  // These updates are automatically batched
  count.value = count.value + 1;
  name.value = name.value + '!';
  count.value = count.value + 1;
  // Only triggers effects once at the end
});
```

**Infinite Loop Detection:**

React Understate automatically detects and prevents infinite loops in effects. If an effect runs more than 10 times per second, it will be automatically disabled with a helpful error message:

```tsx
effect(() => {
  // This will cause an infinite loop
  count.value = count.value + 1; // Effect modifies state it depends on
}, 'problematicEffect');

// Console output:
// 🚨 INFINITE LOOP DETECTED in effect 'problematicEffect'!
// Effect has run 11 times in the last second.
// This usually happens when an effect modifies a state it depends on.
// Consider using preventLoops: false or restructuring your effect.
```

**Loop Prevention Options:**

- `preventLoops: true` (default) - Automatically prevents infinite loops
- `preventLoops: false` - Allows infinite loops (useful for testing or specific use cases)

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

### Async Queuing

Named actions automatically queue async calls to prevent race conditions and ensure proper execution order:

```tsx
import { action, state } from 'react-understate';

const data = state(null, 'data');

// Named async action - calls are queued
const fetchData = action(async (id: string) => {
  console.log(`Fetching data for ID: ${id}`);
  const response = await fetch(`/api/data/${id}`);
  const result = await response.json();
  data.value = result;
  return result;
}, 'fetchData');

// Multiple rapid calls are queued and executed in order
fetchData('1'); // Executes immediately
fetchData('2'); // Queued until first call completes
fetchData('3'); // Queued until second call completes

// Actions without names are not queued
const unqueuedAction = action(async (id: string) => {
  console.log('This may overlap with other calls');
});
```

**Key Benefits:**

- **Prevents Race Conditions**: Ensures async operations complete in the correct order
- **Automatic Batching**: Multiple state updates within queued operations are batched together
- **Better Performance**: Avoids unnecessary concurrent operations that could conflict
- **Named Only**: Queuing only applies to named actions for better control

### Abort Signals

Async actions and effects automatically receive AbortController signals for request cancellation:

```tsx
import { action, effect, state } from 'react-understate';

const data1 = state(null, 'data1');
const data2 = state(null, 'data2');

// Actions receive abort signal as second parameter
const fetchData = action(
  async (id: number, { signal }: { signal: AbortSignal }) => {
    const response = await fetch(`https://api.example.com/data/${id}`, {
      signal,
    });
    data1.value = await response.json();
  },
  'fetchData',
);

// Effects receive abort signal as first parameter
const processData = effect(async ({ signal }: { signal: AbortSignal }) => {
  const { id } = data1.requiredValue;
  const response = await fetch(`https://api.example.com/process/${id}`, {
    signal,
  });
  data2.value = await response.json();
}, 'processData');

// Multiple rapid calls automatically abort previous requests
fetchData(1); // Starts request
fetchData(2); // Aborts previous request, starts new one
fetchData(3); // Aborts previous request, starts new one
```

**Key Features:**

- **Automatic Cancellation**: Previous requests are automatically aborted when new ones start
- **Standard Web API**: Uses native AbortController and AbortSignal
- **Fetch Integration**: Works seamlessly with fetch API and other abortable operations
- **Error Handling**: AbortError is automatically handled for cancelled requests

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
import { state, useUnderstate, action } from 'react-understate';

const store = {
  count: state(0),
  increment: action(() => {
    store.count.value++;
  }, 'increment'),
};

function Counter() {
  const { count, increment } = useUnderstate(store);
  return <button onClick={increment}>{count}</button>;
}
```

### Store Object Pattern

Organize related state and actions together:

```tsx
import { state, derived, action } from 'react-understate';

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
  addTodo: action(() => {
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
  }, 'addTodo'),

  toggleTodo: action((id: number) => {
    todoStore.todos.value = todoStore.todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
  }, 'toggleTodo'),

  setFilter: action((filter: typeof todoStore.filter.value) => {
    todoStore.filter.value = filter;
  }, 'setFilter'),
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
import { state, action } from 'react-understate';

// ✅ GOOD - Business logic in store
const store = {
  // State
  user: state(null),
  loading: state(false),

  // Actions (business logic)
  login: action(async (email: string, password: string) => {
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
  }, 'login'),

  logout: action(() => {
    store.user.value = null;
  }, 'logout'),
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
    store.newTodo.value = 'Learn React Understate';
    store.addTodo();
    expect(store.todos.value).toHaveLength(1);
    expect(store.todos.value[0].text).toBe('Learn React Understate');
  });

  it('should toggle todo completion', () => {
    store.newTodo.value = 'Test todo';
    store.addTodo();
    const todoId = store.todos.value[0].id;

    store.toggleTodo(todoId);
    expect(store.todos.value[0].completed).toBe(true);
  });
});
```

### Key Principles

1. **Create states at module level** - Never inside components
2. **Use store object pattern** - Group related state and actions together
3. **Always use actions for state updates** - Never update state directly, always use actions
4. **Separate business logic from UI** - Keep state and actions together, UI only calls actions
5. **No nested understate functions** - Never call any understate function inside another understate function
6. **Batch related updates** - Use `batch()` for multiple simultaneous updates
7. **Prefer derived over effects** - Use derived for computed state, effects for side effects
8. **Use object spread for updates** - Maintain immutability with object/array updates
9. **Handle errors in async updates** - Always wrap async operations in try-catch
10. **Use TypeScript** - Take advantage of full type safety and immutability

### No Nested Understate Functions

React Understate enforces a strict rule: **no understate function should be called inside any other understate function**. This keeps your code predictable and prevents complex dependency chains.

```tsx
// ✅ GOOD - All understate functions at top level
const count = state(0, 'count');
const doubled = derived(() => count.value * 2, 'doubled');
const increment = action(() => {
  count.value = count.value + 1;
}, 'increment');

effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
}, 'logCount');

// ❌ BAD - Nested understate functions
effect(() => {
  const nestedState = state(0); // ❌ No state inside effect
  const nestedDerived = derived(() => nestedState.value * 2); // ❌ No derived inside effect
  const nestedAction = action(() => {
    nestedState.value = nestedState.value + 1;
  }); // ❌ No action inside effect
}, 'badEffect');

// ❌ BAD - Nested in derived
const badDerived = derived(() => {
  const nestedState = state(0); // ❌ No state inside derived
  return nestedState.value;
}, 'badDerived');

// ❌ BAD - Nested in action
const badAction = action(() => {
  const nestedState = state(0); // ❌ No state inside action
  const nestedEffect = effect(() => {
    console.log('nested');
  }); // ❌ No effect inside action
}, 'badAction');
```

**Why this rule exists:**

- **Predictability** - All reactive elements are created at module level
- **Performance** - Prevents memory leaks from repeated creation
- **Debugging** - Clear separation between reactive elements and business logic
- **Maintainability** - Easier to understand and modify code

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
import { state, derived, action, persistLocalStorage } from 'react-understate';

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
const addTodo = action(() => {
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
}, 'addTodo');

const toggleTodo = action((id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}, 'toggleTodo');

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
- `effect(fn: () => void | (() => void) | Promise<void>, name?: string, options?: EffectOptions): () => void` - Create an effect
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
type EffectOptions = {
  once?: boolean; // Run effect only once, ignore subsequent dependency changes
  preventOverlap?: boolean; // Prevent overlapping executions of async effects
  preventLoops?: boolean; // Automatically prevent infinite loops (default: true)
};

type PersistOptions = {
  loadInitial?: boolean; // Load initial value from storage (default: true)
  syncAcrossTabs?: boolean; // Sync changes across tabs (default: true)
  serialize?: (value: T) => string; // Custom serializer (default: JSON.stringify)
  deserialize?: (value: string) => T; // Custom deserializer (default: JSON.parse)
  onError?: (error: Error) => void; // Error handler
};
```

## Breaking Changes

### Version 1.8.0

- **State Setters Now Accept Async Functions**: State setters can now accept async functions directly:

  ```tsx
  // ✅ New in 1.8.0 - async setters
  count.value = async prev => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return prev + 1;
  };
  ```

- **Effect Options**: Effects now accept an options parameter for better control:
  ```tsx
  // ✅ New in 1.8.0 - effect options
  effect(
    () => {
      // effect logic
    },
    'effectName',
    { once: true, preventOverlap: true },
  );
  ```

## License

MIT © [mjbeswick](https://github.com/mjbeswick)

---

**Note**: This library is actively maintained and follows semantic versioning. For the latest updates and breaking changes, please check the [CHANGELOG.md](CHANGELOG.md).
