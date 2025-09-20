// ❌ Don't mutate state directly
const badUpdate = () => {
  const currentTodos = todos();
  currentTodos.push(newTodo); // Mutates the array!
  todos(currentTodos); // This won't trigger updates correctly
};

// ✅ Always create new objects/arrays
const goodUpdate = () => {
  todos(prev => [...prev, newTodo]);
};

// ❌ Don't create state inside components
function BadComponent() {
  const [localState] = useState(() => state(0)); // Creates new state on every render!
  return <div>{useUnderstate(localState)}</div>;
}

// ✅ Create state outside components or use useState for local state
const componentState = state(0, { name: 'componentState' });

function GoodComponent() {
  const value = useUnderstate(componentState);
  return <div>{value}</div>;
}

// ❌ Don't use state for derived values
const totalItems = state(0, { name: 'totalItems' });

const updateTotal = () => {
  totalItems(todos().length); // Manual sync required!
};

// ✅ Use derived for computed values
const totalItems = derived(() => todos().length, { name: 'totalItems' });

// ❌ Don't ignore batching for multiple updates
const slowUpdate = () => {
  user(prev => ({ ...prev, name: 'John' }));    // Triggers re-render
  user(prev => ({ ...prev, email: 'john@...' })); // Triggers re-render
  user(prev => ({ ...prev, age: 30 }));           // Triggers re-render
};

// ✅ Use batch() for multiple related updates
const fastUpdate = () => {
  batch(() => {
    user(prev => ({ ...prev, name: 'John' }));
    user(prev => ({ ...prev, email: 'john@...' }));
    user(prev => ({ ...prev, age: 30 }));
    // Only one re-render for all updates
  });
};

// ❌ Don't create circular dependencies
const a = derived(() => b() + 1, { name: 'a' });
const b = derived(() => a() + 1, { name: 'b' }); // Circular!

// ✅ Design dependencies as a directed acyclic graph
const base = state(0, { name: 'base' });
const derived1 = derived(() => base() + 1, { name: 'derived1' });
const derived2 = derived(() => derived1() * 2, { name: 'derived2' });