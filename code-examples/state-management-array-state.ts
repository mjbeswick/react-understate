import { arrayState, state, action } from 'react-understate';

// Basic array state
const items = arrayState<string>(['apple', 'banana', 'cherry'], {
  name: 'fruits',
});

// Array state with objects
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const todos = arrayState<Todo>(
  [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build app', completed: true },
  ],
  { name: 'todos' },
);

// Regular state for comparison
const regularArray = state<string[]>(['a', 'b', 'c'], 'regularArray');

// Actions for array operations
const addItem = action((item: string) => {
  items.push(item);
}, 'addItem');

const removeItem = action((index: number) => {
  items.splice(index, 1);
}, 'removeItem');

const updateItem = action((index: number, newItem: string) => {
  items.splice(index, 1, newItem);
}, 'updateItem');

const sortItems = action(() => {
  items.sort();
}, 'sortItems');

// Todo actions
const addTodo = action((text: string) => {
  const newId = Math.max(...todos.map(t => t.id), 0) + 1;
  todos.push({ id: newId, text, completed: false });
}, 'addTodo');

const toggleTodo = action((id: number) => {
  const index = todos.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.splice(index, 1, {
      ...todos[index],
      completed: !todos[index].completed,
    });
  }
}, 'toggleTodo');

const clearCompleted = action(() => {
  todos.filter(todo => !todo.completed);
}, 'clearCompleted');

// Derived values
const completedTodos = () => todos.filter(todo => todo.completed);
const pendingTodos = () => todos.filter(todo => !todo.completed);
const todoStats = () => ({
  total: todos.length,
  completed: completedTodos().length,
  pending: pendingTodos().length,
});

// Array state methods demonstration
const demonstrateArrayMethods = () => {
  // Mutating methods (trigger subscriptions)
  items.push('date', 'elderberry');
  items.pop();
  items.unshift('apricot');
  items.shift();
  items.splice(1, 2, 'blueberry', 'coconut');
  items.sort();
  items.reverse();
  items.fill('grape', 1, 3);

  // Non-mutating methods (don't trigger subscriptions)
  const first = items.at(0);
  const last = items.at(-1);
  const sliced = items.slice(1, 3);
  const joined = items.join(', ');
  const found = items.find(item => item.startsWith('b'));
  const filtered = items.filter(item => item.length > 5);
  const mapped = items.map(item => item.toUpperCase());
  const reduced = items.reduce((acc, item) => acc + item.length, 0);

  // Utility methods
  items.clear();
  items.set(['new', 'array', 'items']);
  items.batch(arr => {
    arr.push('batch1');
    arr.push('batch2');
    arr.sort();
  });
};

export {
  items,
  todos,
  regularArray,
  addItem,
  removeItem,
  updateItem,
  sortItems,
  addTodo,
  toggleTodo,
  clearCompleted,
  completedTodos,
  pendingTodos,
  todoStats,
  demonstrateArrayMethods,
};

