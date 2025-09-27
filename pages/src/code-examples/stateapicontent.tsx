import { state, useUnderstate } from 'react-understate';

// Create state with any primitive value
const count = state(0);
const name = state('John Doe');
const isLoggedIn = state(false);

function Counter() {
  const [currentCount] = useUnderstate(count);

  return (
    <div>
      <h2>Count: {currentCount}</h2>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => (count.value = 0)}>Reset</button>
    </div>
  );
}
