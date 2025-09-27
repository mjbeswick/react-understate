import { state, effect } from 'react-understate';

const count = state(0, 'count');

// Effect runs immediately and when count changes
const dispose = effect(() => {
  console.log(`Count is now: ${count.value}`);
}, 'logCount');

count.value = 5; // Logs: "Count is now: 5"
count.value = 10; // Logs: "Count is now: 10"

// Stop the effect when no longer needed
dispose();
