import { state, action } from 'react-understate';

// Basic array state
const items = state<string[]>(['apple', 'banana', 'cherry'], {
  name: 'fruits',
  observeMutations: true,
});

// Array state with objects
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const todos = state<Todo[]>(
  [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build app', completed: true },
  ],
  { name: 'todos', observeMutations: true },
);

// Regular state for comparison
const regularArray = state<string[]>(['a', 'b', 'c'], 'regularArray');

// Actions for array operations
const addItem = action((item: string) => {
  items.value.push(item);
}, 'addItem');

const removeItem = action((index: number) => {
  items.value.splice(index, 1);
}, 'removeItem');

const updateItem = action((index: number, newItem: string) => {
  items.value.splice(index, 1, newItem);
}, 'updateItem');

const sortItems = action(() => {
  items.value.sort();
}, 'sortItems');

// Todo actions
const addTodo = action((text: string) => {
  const newId = Math.max(...todos.map(t => t.id), 0) + 1;
  todos.value.push({ id: newId, text, completed: false });
}, 'addTodo');

const toggleTodo = action((id: number) => {
  const index = todos.value.findIndex(todo => todo.id === id);
  if (index !== -1) {
    todos.value.splice(index, 1, {
      ...todos.value[index],
      completed: !todos.value[index].completed,
    });
  }
}, 'toggleTodo');

const clearCompleted = action(() => {
  todos.value = todos.value.filter(todo => !todo.completed);
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
  items.value.push('date', 'elderberry');
  items.value.pop();
  items.value.unshift('apricot');
  items.value.shift();
  items.value.splice(1, 2, 'blueberry', 'coconut');
  items.value.sort();
  items.value.reverse();
  items.value.fill('grape', 1, 3);

  // Non-mutating methods (don't trigger subscriptions)
  const first = items.value.at(0);
  const last = items.value.at(-1);
  const sliced = items.value.slice(1, 3);
  const joined = items.value.join(', ');
  const found = items.value.find(item => item.startsWith('b'));
  const filtered = items.value.filter(item => item.length > 5);
  const mapped = items.value.map(item => item.toUpperCase());
  const reduced = items.value.reduce((acc, item) => acc + item.length, 0);

  // Utility methods
  // Reset
  items.value = [];
  items.value = ['new', 'array', 'items'];
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
