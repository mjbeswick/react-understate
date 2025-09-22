import { state, batch, effect } from 'react-understate';

export const firstName = state<null | string>(null, 'firstName');
export const lastName = state<null | string>(null, 'lastName');

effect(() => {
  console.log(`${firstName.value} ${lastName.value}`);
});

// Batch updates to prevent multiple re-renders
batch(() => {
  firstName.value = 'John';
  lastName.value = 'Doe';
});

// Logs: "John Doe"
