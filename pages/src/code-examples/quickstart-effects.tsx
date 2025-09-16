import { state, effect } from 'react-understate';

const count = state(0);

// Effect runs whenever count changes
effect(() => {
  console.log('state: Count changed to:', count.get());

  // Save to localStorage
  localStorage.setItem('count', count.get().toString());
});

// Load initial value from localStorage
const savedCount = localStorage.getItem('count');
if (savedCount) {
  count.set(parseInt(savedCount, 10));
}
