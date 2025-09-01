# Deep Freezing Demo

This demo showcases the automatic deep freezing functionality in React Understate.

## What it demonstrates

- **Object Freezing**: Objects are automatically frozen when set in state
- **Array Freezing**: Arrays are automatically frozen when set in state
- **Nested Freezing**: Deep freezing works recursively on nested objects
- **Mutation Prevention**: Direct mutations fail, forcing immutable patterns
- **Immutable Updates**: Proper immutable update patterns work correctly

## How to run

1. Build the project first: `npm run build`
2. Open `index.html` in a web browser
3. Click the test buttons to see deep freezing in action

## Key Benefits

- **Prevents Bugs**: Catches accidental mutations at runtime
- **Enforces Best Practices**: Forces use of immutable update patterns
- **Improves Reactivity**: Ensures state changes are always detectable
- **Better Performance**: Helps React optimize re-renders

## Example Code

```tsx
import { state } from 'react-understate';

// Objects are automatically frozen
const user = state({ name: 'John', age: 30 });

// ❌ This will fail (object is frozen)
// user.value.name = 'Jane';

// ✅ This works (immutable pattern)
user.value = { ...user.value, name: 'Jane' };

// Arrays are also automatically frozen
const items = state(['apple', 'banana']);

// ❌ This will fail (array is frozen)
// items.value.push('cherry');

// ✅ This works (immutable pattern)
items.value = [...items.value, 'cherry'];
```

## What you'll see

The demo will show:

- Objects and arrays are automatically frozen
- Direct mutations fail (either throw errors or fail silently)
- Immutable updates work correctly
- New objects/arrays are also automatically frozen
- Deep freezing works recursively on nested structures
