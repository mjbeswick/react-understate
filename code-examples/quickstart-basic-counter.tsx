import { useUnderstate } from 'react-understate';
import * as store from './quickstart';

export function Counter() {
  // Subscribe to state changes
  const { count, increment, decrement, reset } = useUnderstate(store);

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
