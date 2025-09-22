import { state, useUnderstate } from 'react-understate';

const count = state(0, 'count');
const name = state('John', 'name');
const isLoading = state(false, 'isLoading');

function UserDisplay() {
  // Array destructuring - order matches parameters
  const [currentCount, currentName, loading] = useUnderstate(count, name, isLoading);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{currentName}</h2>
      <p>Count: {currentCount}</p>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => name.value = 'Jane'}>Change Name</button>
    </div>
  );
}

// Single state subscription
function SimpleCounter() {
  const [currentCount] = useUnderstate(count);
  
  return (
    <div>
      Count: {currentCount}
      <button onClick={() => count.value++}>+</button>
    </div>
  );
}