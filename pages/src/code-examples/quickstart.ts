import { state } from 'react-understate';

// Create a reactive state with initial value
export const count = state(0);

export const increment = () => count.set(count.value + 1);
export const decrement = () => count.set(count.value - 1);
export const reset = () => count.set(0);
