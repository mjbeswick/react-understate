// ❌ Bad: State update in effect
const count = state(0, { name: 'count' });

effect(() => {
  if (count.value > 10) {
    count.value = 0; // This should be in an action
  }
}, { name: 'badEffect' });