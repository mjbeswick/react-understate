import { state, derived } from './src';

// Test to demonstrate the missing optimization
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

// Test case: change dependencies so result goes back to original
console.log('\n--- Testing optimization ---');
console.log('Current sum:', sum.value);
console.log('Subscriber calls before changes:', subscriberCallCount);

// Change a dependency - this should trigger subscriber
a.value = 2; // Now a=2, b=2, sum=4
console.log('After changing a to 2, sum:', sum.value); // 4
console.log('Subscriber calls so far:', subscriberCallCount); // Should be 1

// Change b so that sum goes back to original value - this should NOT trigger subscriber
b.value = 1; // Now a=2, b=1, sum=3 (same as initial)
console.log('After changing b to 1, sum:', sum.value); // 3
console.log('Subscriber calls so far:', subscriberCallCount); // Should still be 1

// The subscriber should only be called when the result actually changes!

unsubscribe();
