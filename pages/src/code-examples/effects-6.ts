// ✅ Good: State update in action
const count = state(0, { name: 'count' });

const resetCount = action(() => {
  count.value = 0;
}, 'resetCount');

effect(
  () => {
    if (count.value > 10) {
      resetCount(); // Call action instead
    }
  },
  { name: 'goodEffect' },
);
