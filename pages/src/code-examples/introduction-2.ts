import { state, action } from 'react-understate';

export const count = state(0, 'count');

export const increment = action(() => {
  count.value++;
}, 'increment');

export const decrement = action(() => {
  count.value--;
}, 'decrement');

export const reset = action(() => {
  count.value = 0;
}, 'reset');
