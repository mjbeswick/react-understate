import { state, effect, action } from 'react-understate';

const count = state(0);

// Effect runs whenever count changes
effect(() => {
  console.log('state: Count changed to:', count.value);
});

// Create actions for state updates
const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

// Use actions to update state
setCount(5);
// Logs: "state: Count changed to: 5"

setCount(10);
// Logs: "state: Count changed to: 10"
