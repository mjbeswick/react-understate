import { state, effect, configureDebug } from 'react-understate';

// Enable debugging globally
configureDebug({ enabled: true, showFile: true });

const count = state(0, 'counter');
const user = state(null, 'user');

// Named effects for better debugging
effect(() => {
  console.log(\`Counter effect: count is \${count.value}\`);
}, 'logCounter');

effect(async ({ signal }) => {
  if (user.value) {
    console.log(\`User effect: loading data for \${user.value.name}\`);
    // Async operations...
  }
}, 'loadUserData', { preventOverlap: true });

// Debug output will show:
// [effect: logCounter] Effect running
// [effect: loadUserData] Effect running (async)
// [effect: loadUserData] Effect completed in 150ms

count.value = 5;
// [effect: logCounter] Effect running (triggered by counter)