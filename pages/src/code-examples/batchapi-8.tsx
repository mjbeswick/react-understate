import { state, action } from 'react-understate';

const count = state(0);
const message = state('');

// ✅ Automatically batched in event handlers
function handleClick() {
  count.value++; // These updates are automatically
  message.value = `Count is ${count.value}`; // batched together
}

// ✅ Automatically batched in actions
const incrementWithMessage = action(() => {
  count.value++;
  message.value = `Count is ${count.value}`;
});

// ❌ May need manual batching in async contexts
async function handleAsyncUpdate() {
  const result = await fetchData();

  // These might not be automatically batched
  batch(() => {
    count.value = result.count;
    message.value = result.message;
  });
}

// ✅ Automatically batched in setTimeout/promises in React 18+
function delayedUpdate() {
  setTimeout(() => {
    count.value++; // Automatically batched in React 18+
    message.value = 'Updated!';
  }, 1000);
}
