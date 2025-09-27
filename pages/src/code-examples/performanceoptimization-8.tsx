import { state, effect } from 'react-understate';

const data = state([]);

// Effect with proper cleanup
const dataEffect = effect(() => {
  const interval = setInterval(() => {
    // Update data periodically
    data.value = [...data.value, { id: Date.now(), value: Math.random() }];
  }, 1000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
}, 'dataEffect');

// Manual cleanup when needed
const cleanup = dataEffect;
// Later...
cleanup();
