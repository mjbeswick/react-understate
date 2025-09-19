import { state, derived } from './src';

// Test to demonstrate what the user might be asking for
const a = state(1, 'a');
const b = state(2, 'b');

// This derived value should only update when the sum actually changes
const sum = derived(() => {
  const result = a.value + b.value;
  console.log(
    'Computing sum: a =',
    a.value,
    'b =',
    b.value,
    'result =',
    result,
  );
  return result;
}, 'sum');

let subscriberCallCount = 0;
const unsubscribe = sum.subscribe(() => {
  subscriberCallCount++;
  console.log(
    'Subscriber called, sum is:',
    sum.value,
    'call #',
    subscriberCallCount,
  );
});

console.log('Initial sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (initial)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 2; // Now a=2, b=2, sum=4
console.log('After changing a to 2, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = 1; // Now a=2, b=1, sum=3 (same as initial)
console.log('After changing b to 1, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 3; // Now a=3, b=1, sum=4
console.log('After changing a to 3, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = 0; // Now a=3, b=0, sum=3 (same as initial)
console.log('After changing b to 0, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 4; // Now a=4, b=0, sum=4
console.log('After changing a to 4, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = -1; // Now a=4, b=-1, sum=3 (same as initial)
console.log('After changing b to -1, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 5; // Now a=5, b=-1, sum=4
console.log('After changing a to 5, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = -2; // Now a=5, b=-2, sum=3 (same as initial)
console.log('After changing b to -2, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 6; // Now a=6, b=-2, sum=4
console.log('After changing a to 6, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = -3; // Now a=6, b=-3, sum=3 (same as initial)
console.log('After changing b to -3, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

// Test case: change dependencies but result stays the same
console.log('\n--- Testing what user might want ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change both dependencies but result stays the same
a.value = 7; // Now a=7, b=-3, sum=4
console.log('After changing a to 7, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

b.value = -4; // Now a=7, b=-4, sum=3 (same as initial)
console.log('After changing b to -4, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1 (not 2!)

unsubscribe();
