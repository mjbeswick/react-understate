import { effect, batch, state } from 'react-understate';

// This should trigger the ESLint rule
const count = state(0);
const name = state('John');

effect(() => {
  // This should trigger a warning - batch() is redundant inside effects
  batch(() => {
    count.value = count.value + 1;
    name.value = name.value + '!';
  });
}, 'testEffect');

// This should NOT trigger the ESLint rule - batch() outside of effects is fine
batch(() => {
  count.value = 5;
  name.value = 'Jane';
});

// This should NOT trigger the ESLint rule - batch() in action is fine
const updateBoth = () => {
  batch(() => {
    count.value = count.value + 1;
    name.value = name.value + '!';
  });
};
