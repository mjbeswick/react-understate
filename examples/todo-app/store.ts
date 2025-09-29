import { state, derived, action, persistLocalStorage } from 'react-understate';

// Define the Todo type
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

// State
const todos = state<Todo[]>([], 'todos');
const filter = state<'all' | 'active' | 'completed'>('all', 'todosFilter');
const newTodo = state('', 'newTodo');

// Persist state to localStorage (survives browser restart)
persistLocalStorage(todos, 'todos');
persistLocalStorage(filter, 'todos-filter');
// Note: We don't persist newTodo as it's just temporary input

// Computed values
export const filteredTodos = derived(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
}, 'filteredTodos');

export const activeCount = derived(
  () => todos.value.filter(todo => !todo.completed).length,
  'activeCount',
);

export const completedCount = derived(
  () => todos.value.filter(todo => todo.completed).length,
  'completedCount',
);

// Actions
export const setNewTodo = action((text: string) => {
  newTodo.value = text;
}, 'setNewTodo');

export const setFilter = action((newFilter: 'all' | 'active' | 'completed') => {
  filter.value = newFilter;
}, 'setFilter');

export const addTodo = action(() => {
  if (newTodo.value.trim()) {
    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: newTodo.value.trim(),
        completed: false,
      },
    ];
    newTodo.value = '';
  }
}, 'addTodo');

export const toggleTodo = action((id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}, 'toggleTodo');

export const removeTodo = action((id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
}, 'removeTodo');

export const clearCompleted = action(() => {
  todos.value = todos.value.filter(todo => !todo.completed);
}, 'clearCompleted');

export const toggleAll = action(() => {
  const allCompleted = todos.value.every(todo => todo.completed);
  todos.value = todos.value.map(todo => ({
    ...todo,
    completed: !allCompleted,
  }));
}, 'toggleAll');

// Export all the state variables for use in components
export { todos, filter, newTodo };
