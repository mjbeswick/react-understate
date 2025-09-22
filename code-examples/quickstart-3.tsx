import { state, derived, useSubscribe } from 'react-understate';

const count = state(0);

// Derived state automatically recalculates
const doubled = derived(() => count.value * 2);
const isEven = derived(() => count.value % 2 === 0);

function EnhancedCounter() {
  const { count: currentCount, doubled: doubledValue, isEven } = useSubscribe({
    count,
    doubled,
    isEven
  });

  return (
    <div>
      <h2>Count: {currentCount}</h2>
      <p>Doubled: {doubledValue}</p>
      <p>Is Even: {isEven ? 'Yes' : 'No'}</p>
      <button onClick={() => count.value = currentCount + 1}>
        Increment
      </button>
    </div>
  );
}