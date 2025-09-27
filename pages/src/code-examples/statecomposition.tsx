import { state } from 'react-understate';

// Create reusable state factories
function createCounterState(initialValue = 0) {
  const count = state(initialValue);

  return {
    count,
    increment: () => count.value++,
    decrement: () => count.value--,
    reset: () => (count.value = initialValue),
    setValue: (value: number) => (count.value = value),
  };
}

// Use in different parts of your app
const headerCounter = createCounterState(0);
const sidebarCounter = createCounterState(10);
const modalCounter = createCounterState(5);

// Each instance is independent
headerCounter.increment(); // Only affects headerCounter
sidebarCounter.setValue(20); // Only affects sidebarCounter
