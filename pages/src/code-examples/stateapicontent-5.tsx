import { state } from 'react-understate';

const count = state(0);

// Subscribe to changes
const unsubscribe = count.subscribe((newValue, previousValue) => {
  console.log(\`Count changed from \${previousValue} to \${newValue}\`);
});

// Trigger the subscription
count.value = 5; // Logs: "Count changed from 0 to 5"
count.value = 10; // Logs: "Count changed from 5 to 10"

// Clean up when done
unsubscribe();

// Multiple subscribers
const unsubscribe1 = count.subscribe((value) => {
  localStorage.setItem('count', String(value));
});

const unsubscribe2 = count.subscribe((value) => {
  if (value > 100) {
    alert('Count is getting high!');
  }
});

// Clean up all
const cleanup = () => {
  unsubscribe1();
  unsubscribe2();
};