const items = arrayState<string>(['a', 'b', 'c']);

// for...of loop
for (const item of items) {
  console.log(item);
}

// Spread operator
const spread = [...items];

// Array.from()
const fromArray = Array.from(items);