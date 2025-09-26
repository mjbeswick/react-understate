# React Understate ESLint Plugin

ESLint plugin for React Understate to enforce best practices and catch common mistakes.

## Installation

```bash
npm install --save-dev eslint-plugin-react-understate
```

## Usage

### Quick Setup (Recommended)

The easiest way to use this plugin is with the recommended configuration, which includes all rules with sensible defaults:

```json
{
  "extends": ["plugin:react-understate/recommended"]
}
```

Or in your `.eslintrc.js`:

```javascript
module.exports = {
  extends: ['plugin:react-understate/recommended'],
};
```

### Manual Configuration

If you prefer to configure rules individually:

```json
{
  "plugins": ["react-understate"],
  "rules": {
    // Core subscription rules
    "react-understate/require-use-subscribe-for-all-states": "error",
    "react-understate/require-use-subscribe-store-object": "error",

    // State management rules
    "react-understate/no-direct-state-assignment": "error",
    "react-understate/no-state-creation-in-components": "error",
    "react-understate/no-direct-state-mutation": "error",
    "react-understate/require-valid-state-name": "error",

    // Nested function prevention
    "react-understate/no-nested-understate-functions": "error",
    "react-understate/no-nested-effects": "error",
    "react-understate/no-nested-derived": "error",

    // Effect-specific rules
    "react-understate/no-state-creation-in-effects": "error",
    "react-understate/no-derived-creation-in-effects": "error",
    "react-understate/no-batch-in-effects": "warn",
    "react-understate/require-error-handling-in-effects": "warn",

    // Derived-specific rules
    "react-understate/no-state-updates-in-derived": "error",
    "react-understate/no-effect-creation-in-derived": "error",

    // Action-specific rules
    "react-understate/no-library-functions-in-actions": "error",
    "react-understate/no-unused-action-parameters": "warn",

    // Best practices
    "react-understate/prefer-derived-for-computed": "warn",
    "react-understate/prefer-effect-for-side-effects": "warn",
    "react-understate/prefer-batch-for-multiple-updates": "warn",
    "react-understate/require-error-handling-in-async-updates": "warn",
    "react-understate/require-state-subscription-cleanup": "warn",
    "react-understate/no-unused-states": "warn"
  }
}
```

Or in your `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['react-understate'],
  rules: {
    // Core subscription rules
    'react-understate/require-use-subscribe-for-all-states': 'error',
    'react-understate/require-use-subscribe-store-object': 'error',

    // State management rules
    'react-understate/no-direct-state-assignment': 'error',
    'react-understate/no-state-creation-in-components': 'error',
    'react-understate/no-direct-state-mutation': 'error',
    'react-understate/require-valid-state-name': 'error',

    // Nested function prevention
    'react-understate/no-nested-understate-functions': 'error',
    'react-understate/no-nested-effects': 'error',
    'react-understate/no-nested-derived': 'error',

    // Effect-specific rules
    'react-understate/no-state-creation-in-effects': 'error',
    'react-understate/no-derived-creation-in-effects': 'error',
    'react-understate/no-batch-in-effects': 'warn',
    'react-understate/require-error-handling-in-effects': 'warn',

    // Derived-specific rules
    'react-understate/no-state-updates-in-derived': 'error',
    'react-understate/no-effect-creation-in-derived': 'error',

    // Action-specific rules
    'react-understate/no-library-functions-in-actions': 'error',
    'react-understate/no-unused-action-parameters': 'warn',

    // Best practices
    'react-understate/prefer-derived-for-computed': 'warn',
    'react-understate/prefer-effect-for-side-effects': 'warn',
    'react-understate/prefer-batch-for-multiple-updates': 'warn',
    'react-understate/prefer-object-spread-for-updates': 'warn',
    'react-understate/require-error-handling-in-async-updates': 'warn',
    'react-understate/require-state-subscription-cleanup': 'warn',
    'react-understate/no-unused-states': 'warn',
  },
};
```

## Rules

### Core Subscription Rules

#### `require-use-subscribe` (Legacy)

Legacy rule for ensuring state subscription. Use `require-use-subscribe-for-all-states` instead.

#### `require-use-subscribe-for-all-states`

Ensures that when you use `state.value` in a React component, you also call `useUnderstate(state)` to properly subscribe to state changes.

#### ❌ Incorrect

```tsx
import { state, useUnderstate } from 'react-understate';

const count = state(0);

function Counter() {
  // Missing useUnderstate call
  return <div>Count: {count.value}</div>;
}
```

#### ✅ Correct

```tsx
import { state, useUnderstate } from 'react-understate';

const count = state(0);

function Counter() {
  useUnderstate(count); // Properly subscribe to state changes
  return <div>Count: {count.value}</div>;
}
```

### `require-use-subscribe-store-object`

Ensures that when you use store objects in React components, you properly call `useUnderstate(store)` to subscribe to state changes.

#### ❌ Incorrect

```tsx
import { state, useUnderstate } from 'react-understate';

const store = {
  count: state(0),
  name: state('John'),
  increment: () => store.count.value++,
};

function Counter() {
  // Missing useUnderstate call
  return <div>Count: {store.count.value}</div>;
}
```

#### ✅ Correct

```tsx
import { state, useUnderstate } from 'react-understate';

const store = {
  count: state(0),
  name: state('John'),
  increment: () => store.count.value++,
};

function Counter() {
  // Individual states pattern
  useUnderstate(store.count);
  return <div>Count: {store.count.value}</div>;

  // OR store object pattern
  const { count, increment } = useUnderstate(store);
  return <div>Count: {count}</div>;
}
```

### `prefer-batch-for-multiple-updates`

Suggests using `batch()` when multiple state updates happen in sequence to avoid unnecessary re-renders.

#### ❌ Incorrect

```tsx
const handleSubmit = () => {
  firstName.value = 'John';
  lastName.value = 'Doe';
  age.value = 30;
};
```

#### ✅ Correct

```tsx
const handleSubmit = () => {
  batch(() => {
    firstName.value = 'John';
    lastName.value = 'Doe';
    age.value = 30;
  });
};
```

### `no-direct-state-assignment`

Prevents assigning state objects to variables, which breaks reactivity.

#### ❌ Incorrect

```tsx
const badCount = count; // Don't assign states to variables
const badValue = count.value; // Don't store state values
```

#### ✅ Correct

```tsx
const goodCount = count; // Pass the state object itself
```

### `no-state-creation-in-components`

Prevents creating states inside React components, which can cause issues with re-renders.

#### ❌ Incorrect

```tsx
function MyComponent() {
  const count = state(0); // Created on every render!
  return <div>{count.value}</div>;
}
```

#### ✅ Correct

```tsx
const count = state(0); // Created outside component

function MyComponent() {
  useUnderstate(count);
  return <div>{count.value}</div>;
}
```

### `no-nested-effects`

Prevents nested `effect()` calls which can cause performance issues and unexpected behavior.

#### ❌ Incorrect

```tsx
effect(() => {
  console.log('Outer effect');
  effect(() => {
    console.log('Nested effect'); // Not allowed
  });
});
```

#### ✅ Correct

```tsx
effect(() => {
  console.log('Outer effect');
});

effect(() => {
  console.log('Separate effect');
});
```

### `no-nested-derived`

Prevents nested `derived()` calls which can cause performance issues and unexpected behavior.

#### ❌ Incorrect

```tsx
const outer = derived(() => {
  return derived(() => count.value * 2); // Not allowed
});
```

#### ✅ Correct

```tsx
const inner = derived(() => count.value * 2);
const outer = derived(() => inner.value + 1);
```

### `prefer-derived-for-computed`

Suggests using `derived()` instead of manual computations in components.

#### ❌ Incorrect

```tsx
function MyComponent() {
  useUnderstate(count);
  const doubled = count.value * 2; // Recalculated on every render
  return <div>{doubled}</div>;
}
```

#### ✅ Correct

```tsx
const doubled = derived(() => count.value * 2);

function MyComponent() {
  useUnderstate(doubled);
  return <div>{doubled.value}</div>;
}
```

### `prefer-effect-for-side-effects`

Suggests using `effect()` instead of `useEffect()` for state-related side effects.

#### ❌ Incorrect

```tsx
function MyComponent() {
  useUnderstate(count);
  useEffect(() => {
    console.log('Count changed:', count.value);
  }, [count.value]);
}
```

#### ✅ Correct

```tsx
effect(() => {
  console.log('Count changed:', count.value);
});
```

### `no-unused-states`

Detects states that are created but never used.

#### ❌ Incorrect

```tsx
const unusedState = state(0); // Never used anywhere
```

#### ✅ Correct

```tsx
const usedState = state(0);
useUnderstate(usedState);
```

### `require-error-handling-in-async-updates`

Ensures async state updates have proper error handling.

#### ❌ Incorrect

```tsx
await userData.update(async () => {
  const response = await fetch('/api/user');
  return response.json();
});
```

#### ✅ Correct

```tsx
await userData.update(async () => {
  try {
    const response = await fetch('/api/user');
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  } catch (error) {
    console.error('Update failed:', error);
    return userData.value; // Return current value on error
  }
});
```

### State Name Validation Rules

#### `require-valid-state-name`

Ensures state names are valid JavaScript identifiers (no dots, start with letter/underscore/$).

#### ❌ Incorrect

```tsx
const todosFilter = state('all', 'todos-filter'); // Contains dot
const 123count = state(0, '123count'); // Starts with number
```

#### ✅ Correct

```tsx
const todosFilter = state('all', 'todosFilter'); // Valid identifier
const count = state(0, 'count'); // Valid identifier
const _private = state('', '_private'); // Valid identifier
const $special = state('', '$special'); // Valid identifier
```

### Nested Function Prevention Rules

#### `no-nested-understate-functions`

Prevents calling any understate function inside another understate function.

#### ❌ Incorrect

```tsx
effect(() => {
  const nestedState = state(0); // ❌ No state inside effect
  const nestedDerived = derived(() => nestedState.value * 2); // ❌ No derived inside effect
  const nestedAction = action(() => {
    nestedState.value = nestedState.value + 1;
  }); // ❌ No action inside effect
});

const badDerived = derived(() => {
  const nestedState = state(0); // ❌ No state inside derived
  return nestedState.value;
});

const badAction = action(() => {
  const nestedState = state(0); // ❌ No state inside action
  const nestedEffect = effect(() => {
    console.log('nested');
  }); // ❌ No effect inside action
});
```

#### ✅ Correct

```tsx
// All understate functions at top level
const count = state(0, 'count');
const doubled = derived(() => count.value * 2, 'doubled');
const increment = action(() => {
  count.value = count.value + 1;
}, 'increment');

effect(() => {
  console.log(`Count: ${count.value}, Doubled: ${doubled.value}`);
}, 'logCount');
```

### Effect-Specific Rules

#### `no-batch-in-effects`

Prevents redundant `batch()` calls inside effects since effects automatically batch state updates.

#### ❌ Incorrect

```tsx
effect(() => {
  batch(() => {
    // ❌ Redundant - effects auto-batch
    count.value = count.value + 1;
    name.value = name.value + '!';
  });
});
```

#### ✅ Correct

```tsx
effect(() => {
  // Effects automatically batch state updates
  count.value = count.value + 1;
  name.value = name.value + '!';
});
```

#### `no-state-creation-in-effects`

Prevents creating states inside effects.

#### ❌ Incorrect

```tsx
effect(() => {
  const newState = state(0); // ❌ No state creation in effects
  newState.value = 1;
});
```

#### ✅ Correct

```tsx
const newState = state(0); // ✅ Create at top level

effect(() => {
  newState.value = 1; // ✅ Use existing state
});
```

#### `no-derived-creation-in-effects`

Prevents creating derived values inside effects.

#### ❌ Incorrect

```tsx
effect(() => {
  const doubled = derived(() => count.value * 2); // ❌ No derived creation in effects
  console.log(doubled.value);
});
```

#### ✅ Correct

```tsx
const doubled = derived(() => count.value * 2); // ✅ Create at top level

effect(() => {
  console.log(doubled.value); // ✅ Use existing derived
});
```

#### `require-error-handling-in-effects`

Suggests adding error handling in effects.

#### ❌ Incorrect

```tsx
effect(async () => {
  const data = await fetch('/api/data'); // ❌ No error handling
  console.log(data);
});
```

#### ✅ Correct

```tsx
effect(async () => {
  try {
    const data = await fetch('/api/data');
    console.log(data);
  } catch (error) {
    console.error('Effect failed:', error);
  }
});
```

### Derived-Specific Rules

#### `no-state-updates-in-derived`

Prevents state updates inside derived functions.

#### ❌ Incorrect

```tsx
const badDerived = derived(() => {
  count.value = count.value + 1; // ❌ No state updates in derived
  return count.value;
});
```

#### ✅ Correct

```tsx
const goodDerived = derived(() => {
  return count.value * 2; // ✅ Only read values in derived
});
```

#### `no-effect-creation-in-derived`

Prevents creating effects inside derived functions.

#### ❌ Incorrect

```tsx
const badDerived = derived(() => {
  effect(() => {
    console.log('nested effect'); // ❌ No effect creation in derived
  });
  return count.value;
});
```

#### ✅ Correct

```tsx
const goodDerived = derived(() => {
  return count.value * 2; // ✅ Only compute values in derived
});
```

### Action-Specific Rules

#### `no-library-functions-in-actions`

Prevents calling library functions inside actions.

#### ❌ Incorrect

```tsx
const badAction = action(() => {
  console.log('logging'); // ❌ No library functions in actions
  count.value = count.value + 1;
});
```

#### ✅ Correct

```tsx
const goodAction = action(() => {
  count.value = count.value + 1; // ✅ Only state updates in actions
});
```

#### `no-unused-action-parameters`

Detects unused parameters in action functions.

#### ❌ Incorrect

```tsx
const badAction = action((unusedParam: number) => {
  count.value = count.value + 1; // ❌ Parameter not used
});
```

#### ✅ Correct

```tsx
const goodAction = action((amount: number) => {
  count.value = count.value + amount; // ✅ Parameter is used
});
```

### State Mutation Rules

#### `no-direct-state-mutation`

Prevents direct mutation of state values.

#### ❌ Incorrect

```tsx
user.value.name = 'John'; // ❌ Direct mutation
user.value.items.push(newItem); // ❌ Direct mutation
```

#### ✅ Correct

```tsx
user.value = { ...user.value, name: 'John' }; // ✅ Immutable update
user.value = { ...user.value, items: [...user.value.items, newItem] }; // ✅ Immutable update
```

### Cleanup Rules

#### `require-state-subscription-cleanup`

Suggests proper cleanup of state subscriptions in components.

#### ❌ Incorrect

```tsx
function MyComponent() {
  useUnderstate(count);
  // Missing cleanup logic for side effects
  return <div>{count.value}</div>;
}
```

#### ✅ Correct

```tsx
function MyComponent() {
  useUnderstate(count);

  useEffect(() => {
    const cleanup = effect(() => {
      console.log(count.value);
    });
    return cleanup; // ✅ Proper cleanup
  }, []);

  return <div>{count.value}</div>;
}
```

#### `require-full-reactive-access`

Ensures proper reactive subscriptions in derived functions by detecting nested property access on reactive values.

This rule prevents a common issue where accessing nested properties of reactive values (like `imageCache.value[product.id]`) doesn't create proper subscriptions, leading to derived values that don't update when the reactive value changes.

#### ❌ Incorrect

```tsx
const sortedProductsWithImages = derived(() => {
  return sortedProducts.value.map(product => ({
    ...product,
    imageUrl: imageCache.value[product.gtin] ?? null, // Nested access - no subscription!
  }));
});
```

#### ✅ Correct

```tsx
const sortedProductsWithImages = derived(() => {
  const cache = imageCache.value; // Full reactive access - creates subscription
  return sortedProducts.value.map(product => ({
    ...product,
    imageUrl: cache[product.gtin] ?? null,
  }));
});
```

**Why this matters:** The reactive system only tracks direct property access on the root value. When you access `imageCache.value[product.gtin]`, it reads `imageCache.value` (creating a subscription) but then accesses `[product.gtin]` (no subscription). This means the derived value won't update when `imageCache` changes.

## Configuration Options

### `prefer-batch-for-multiple-updates`

You can configure the minimum number of updates required to trigger the rule:

```json
{
  "rules": {
    "react-understate/prefer-batch-for-multiple-updates": [
      "warn",
      { "minUpdates": 2 }
    ]
  }
}
```

## How it works

The rules detect various patterns in your code:

1. **React Components**: Functions that start with uppercase letters (React component convention)
2. **State Usage**: `state.value` property access and state creation
3. **Missing Subscriptions**: When `useUnderstate(state)` is not called for a state that's being used
4. **Store Object Usage**: When store objects are used without proper `useUnderstate` subscription
5. **Performance Issues**: Multiple state updates without batching, nested effects/derived calls
6. **Best Practices**: State creation in components, direct state assignments

## useUnderstate Patterns

The ESLint plugin supports both `useUnderstate` usage patterns:

### Individual States Pattern

```tsx
// Subscribe to individual states
useUnderstate(count, name);
// Access values via .value
const currentCount = count.value;
```

### Store Object Pattern

```tsx
// Subscribe to store object and get current values
const { count, name, increment } = useUnderstate(store);
// Access values directly (no .value needed)
const currentCount = count;
```

## Rule Categories Summary

### **Core Subscription Rules** (3 rules)

- `require-use-subscribe` - Ensures proper state subscription in components (legacy)
- `require-use-subscribe-for-all-states` - Ensures proper state subscription in components
- `require-use-subscribe-store-object` - Ensures proper store object subscription

### **State Management Rules** (4 rules)

- `no-direct-state-assignment` - Prevents state object assignments
- `no-state-creation-in-components` - Prevents state creation in components
- `no-direct-state-mutation` - Prevents direct state value mutation
- `require-valid-state-name` - Validates state name format

### **Nested Function Prevention Rules** (3 rules)

- `no-nested-understate-functions` - Prevents any understate function nesting
- `no-nested-effects` - Prevents nested effect calls
- `no-nested-derived` - Prevents nested derived calls

### **Effect-Specific Rules** (4 rules)

- `no-state-creation-in-effects` - Prevents state creation in effects
- `no-derived-creation-in-effects` - Prevents derived creation in effects
- `no-batch-in-effects` - Prevents redundant batch calls in effects
- `require-error-handling-in-effects` - Suggests error handling in effects

### **Derived-Specific Rules** (2 rules)

- `no-state-updates-in-derived` - Prevents state updates in derived functions
- `no-effect-creation-in-derived` - Prevents effect creation in derived functions

### **Action-Specific Rules** (2 rules)

- `no-library-functions-in-actions` - Prevents library function calls in actions
- `no-unused-action-parameters` - Detects unused action parameters

### **Best Practice Rules** (7 rules)

- `prefer-derived-for-computed` - Suggests derived for computed values
- `prefer-effect-for-side-effects` - Suggests effects for side effects
- `prefer-batch-for-multiple-updates` - Suggests batching for multiple updates
- `require-error-handling-in-async-updates` - Suggests error handling in async updates
- `require-state-subscription-cleanup` - Suggests proper subscription cleanup
- `require-full-reactive-access` - Ensures proper reactive subscriptions in derived functions
- `no-unused-states` - Detects unused states

**Total: 25 rules** (11 errors, 14 warnings)

## Why these rules matter

React Understate has specific patterns and best practices that, when followed, lead to better performance, fewer bugs, and more maintainable code. These ESLint rules help catch issues early in development and enforce consistent usage patterns.

The rules are organized to prevent common pitfalls:

- **Memory leaks** from improper subscriptions
- **Performance issues** from nested function calls
- **Infinite loops** from improper state updates
- **State corruption** from direct mutations
- **Debugging difficulties** from unclear patterns
