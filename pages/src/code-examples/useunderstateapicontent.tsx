import { state, useUnderstate, action } from 'react-understate';

// Create a store object
const counterStore = {
  count: state(0, 'count'),
  increment: action(() => {
    counterStore.count.value++;
  }, 'increment'),
  decrement: action(() => {
    counterStore.count.value--;
  }, 'decrement'),
  reset: action(() => {
    counterStore.count.value = 0;
  }, 'reset'),
};

function Counter() {
  // Extract current values and actions
  const { count, increment, decrement, reset } = useUnderstate(counterStore);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
