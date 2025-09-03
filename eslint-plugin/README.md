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
  extends: ["plugin:react-understate/recommended"],
};
```

### Manual Configuration

If you prefer to configure rules individually:

```json
{
  "plugins": ["react-understate"],
  "rules": {
    "react-understate/require-use-subscribe": "error",
    "react-understate/prefer-batch-for-multiple-updates": "warn",
    "react-understate/no-direct-state-assignment": "error",
    "react-understate/no-state-creation-in-components": "error",
    "react-understate/no-nested-effects": "error",
    "react-understate/no-nested-derived": "error"
  }
}
```

Or in your `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ["react-understate"],
  rules: {
    "react-understate/require-use-subscribe": "error",
    "react-understate/prefer-batch-for-multiple-updates": "warn",
    "react-understate/no-direct-state-assignment": "error",
    "react-understate/no-state-creation-in-components": "error",
    "react-understate/no-nested-effects": "error",
    "react-understate/no-nested-derived": "error",
  },
};
```

## Rules

### `require-use-subscribe`

Ensures that when you use `state.value` in a React component, you also call `useUnderstate(state)` to properly subscribe to state changes.

#### ❌ Incorrect

```tsx
import { state, useUnderstate } from "react-understate";

const count = state(0);

function Counter() {
  // Missing useUnderstate call
  return <div>Count: {count.value}</div>;
}
```

#### ✅ Correct

```tsx
import { state, useUnderstate } from "react-understate";

const count = state(0);

function Counter() {
  useUnderstate(count); // Properly subscribe to state changes
  return <div>Count: {count.value}</div>;
}
```

### `prefer-batch-for-multiple-updates`

Suggests using `batch()` when multiple state updates happen in sequence to avoid unnecessary re-renders.

#### ❌ Incorrect

```tsx
const handleSubmit = () => {
  firstName.value = "John";
  lastName.value = "Doe";
  age.value = 30;
};
```

#### ✅ Correct

```tsx
const handleSubmit = () => {
  batch(() => {
    firstName.value = "John";
    lastName.value = "Doe";
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
  console.log("Outer effect");
  effect(() => {
    console.log("Nested effect"); // Not allowed
  });
});
```

#### ✅ Correct

```tsx
effect(() => {
  console.log("Outer effect");
});

effect(() => {
  console.log("Separate effect");
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
    console.log("Count changed:", count.value);
  }, [count.value]);
}
```

#### ✅ Correct

```tsx
effect(() => {
  console.log("Count changed:", count.value);
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
  const response = await fetch("/api/user");
  return response.json();
});
```

#### ✅ Correct

```tsx
await userData.update(async () => {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) throw new Error("Failed to fetch");
    return response.json();
  } catch (error) {
    console.error("Update failed:", error);
    return userData.value; // Return current value on error
  }
});
```

### `prefer-object-spread-for-updates`

Encourages immutable updates for object states.

#### ❌ Incorrect

```tsx
user.value.name = "John"; // Mutates the object
```

#### ✅ Correct

```tsx
user.value = { ...user.value, name: "John" };
```

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
4. **Performance Issues**: Multiple state updates without batching, nested effects/derived calls
5. **Best Practices**: State creation in components, direct state assignments

## Why these rules matter

React Understate has specific patterns and best practices that, when followed, lead to better performance, fewer bugs, and more maintainable code. These ESLint rules help catch issues early in development and enforce consistent usage patterns.
