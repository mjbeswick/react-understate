import { state, action, useUnderstate } from 'react-understate';

const count = state(0);

// Create named actions for state modifications
const increment = action(() => {
  count.value++;
}, 'increment');

const decrement = action(() => {
  count.value--;
}, 'decrement');

const reset = action(() => {
  count.value = 0;
}, 'reset');

// Action with parameters
const setCount = action((newValue: number) => {
  count.value = newValue;
}, 'setCount');

const addAmount = action((amount: number) => {
  count.value += amount;
}, 'addAmount');

function Counter() {
  const [currentCount] = useUnderstate(count);

  return (
    <div>
      <h2>Count: {currentCount}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={() => addAmount(5)}>+5</button>
      <button onClick={() => setCount(100)}>Set to 100</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
