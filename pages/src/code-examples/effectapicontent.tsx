import { state, effect, action } from 'react-understate';

const count = state(0, 'count');

// Effect runs immediately and when count changes
const dispose = effect(() => {
  console.log(\`Count is now: \${count.value}\`);
}, 'logCount');

// Create action for state updates
const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

setCount(5); // Logs: "Count is now: 5"
setCount(10); // Logs: "Count is now: 10"

// Stop the effect when no longer needed
dispose();