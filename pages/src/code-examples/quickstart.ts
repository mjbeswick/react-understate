import { action, state } from 'react-understate';

// Create a reactive state with initial value
export const count = state(0, 'count');

// Create an action to increment the count
export const increment = action(() => count.value + 1);

// Create an action to decrement the count
export const decrement = action(() => count.value - 1);

// Create an action to reset the count
export const reset = action(() => (count.value = 0));
