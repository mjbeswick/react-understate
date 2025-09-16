// todoStore.ts
import {
  state,
  derived,
  action,
  persistLocalStorage,
} from 'react-understate';

// Types
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export type FilterType = 'all' | 'active' | 'completed';

// State variables
const todos = state<Todo[]>([], 'todos');
const filter = state<FilterType>('all', 'todosFilter');
const newTodo = state('', 'newTodo');

// Persistence
persistLocalStorage(todos, 'todos');
persistLocalStorage(filter, 'todos-filter');

// Derived values
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

export const totalCount = derived(() => todos.value.length, 'totalCount');

export const hasCompletedTodos = derived(
  () => completedCount.value > 0,
  'hasCompletedTodos',
);

export const allCompleted = derived(
  () => totalCount.value > 0 && activeCount.value === 0,
  'allCompleted',
);

// Actions
export const setNewTodo = action((text: string) => {
  newTodo.value = text;
}, 'setNewTodo');

export const setFilter = action((newFilter: FilterType) => {
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

export const updateTodo = action((id: number, text: string) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, text } : todo,
  );
}, 'updateTodo');

export const clearCompleted = action(() => {
  todos.value = todos.value.filter(todo => !todo.completed);
}, 'clearCompleted');

export const toggleAll = action(() => {
  const shouldComplete = !allCompleted.value;
  todos.value = todos.value.map(todo => ({
    ...todo,
    completed: shouldComplete,
  }));
}, 'toggleAll');

// Export the complete store
export const todoStore = {
  // State access
  todos,
  filter,
  newTodo,
  
  // Computed values
  filteredTodos,
  activeCount,
  completedCount,
  totalCount,
  hasCompletedTodos,
  allCompleted,
  
  // Actions
  setNewTodo,
  setFilter,
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  clearCompleted,
  toggleAll,
};