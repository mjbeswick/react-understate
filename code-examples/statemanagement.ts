// ❌ Avoid: Direct state updates
const count = state(0, { name: 'count' });

// Direct assignment
count.value = 42;

// Direct function call
count(prev => prev + 1);

// ✅ Good: Use actions for state updates
const count = state(0, { name: 'count' });

const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

const incrementCount = action(() => {
  count.value = count.value + 1;
}, 'incrementCount');

// Use actions instead
setCount(42);
incrementCount();