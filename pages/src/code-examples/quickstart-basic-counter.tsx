import React from 'react';
import { useSubscribe } from 'react-understate';

function Counter() {
  // Subscribe to state changes
  const { count: currentCount } = useSubscribe({ count });

  const increment = () => count.set(currentCount + 1);
  const decrement = () => count.set(currentCount - 1);
  const reset = () => count.set(0);

  return (
    <div>
      <h2>Count: {currentCount}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
