// store.ts
import { state, derived, action } from 'react-understate';

// State variables
const count = state(0, 'count');
const multiplier = state(2, 'multiplier');

// Derived values
export const result = derived(() => count.value * multiplier.value, 'result');

// Actions
export const increment = action(() => {
  count.value++;
}, 'increment');

export const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

export const setMultiplier = action((value: number) => {
  multiplier.value = value;
}, 'setMultiplier');

// Export the store object
export const counterStore = {
  // State access
  count,
  multiplier,
  
  // Computed values
  result,
  
  // Actions
  increment,
  setCount,
  setMultiplier,
};