import { state } from 'react-understate';
const items = state<string[]>(['a', 'b', 'c'], { observeMutations: true });

// for...of loop
for (const item of items) {
  console.log(item);
}

// Spread operator
const spread = [...items];

// Array.from()
const fromArray = Array.from(items);
