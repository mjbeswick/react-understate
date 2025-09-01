# eslint-plugin-react-understate

ESLint plugin to check for missing `useSubscribe` calls when using `state.value` in React components.

## Installation

```bash
npm install --save-dev eslint-plugin-react-understate
```

## Usage

Add the plugin to your ESLint configuration:

```json
{
  "plugins": ["react-understate"],
  "rules": {
    "react-understate/require-use-subscribe": "error"
  }
}
```

Or in your `.eslintrc.js`:

```javascript
module.exports = {
  plugins: ['react-understate'],
  rules: {
    'react-understate/require-use-subscribe': 'error',
  },
};
```

## Rules

### `require-use-subscribe`

This rule ensures that when you use `state.value` in a React component, you also call `useSubscribe(state)` to properly subscribe to state changes.

#### ❌ Incorrect

```tsx
import { state, useSubscribe } from 'react-understate';

const count = state(0);

function Counter() {
  // Missing useSubscribe call
  return <div>Count: {count.value}</div>;
}
```

#### ✅ Correct

```tsx
import { state, useSubscribe } from 'react-understate';

const count = state(0);

function Counter() {
  useSubscribe(count); // Properly subscribe to state changes
  return <div>Count: {count.value}</div>;
}
```

#### Multiple States

```tsx
import { state, useSubscribe } from 'react-understate';

const count = state(0);
const name = state('John');

function UserInfo() {
  useSubscribe(count);
  useSubscribe(name);

  return (
    <div>
      <p>Name: {name.value}</p>
      <p>Count: {count.value}</p>
    </div>
  );
}
```

## How it works

The rule detects:

1. **React Components**: Functions that start with uppercase letters (React component convention)
2. **State Usage**: `state.value` property access
3. **Missing Subscriptions**: When `useSubscribe(state)` is not called for a state that's being used

The rule will report an error if you use `state.value` in a React component without calling `useSubscribe(state)` first.

## Why this matters

React Understate requires explicit subscription to state changes using `useSubscribe`. Without it, components won't re-render when state changes, leading to stale UI and bugs.

This ESLint rule helps catch these issues early in development.
