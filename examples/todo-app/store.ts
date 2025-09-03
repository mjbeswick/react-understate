import { state, derived } from 'react-understate';

// Define the Todo type
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

// State
const todos = state<Todo[]>([]);
const filter = state<'all' | 'active' | 'completed'>('all');
const newTodo = state('');

// Computed values
export const filteredTodos = derived(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter((todo) => !todo.completed);
    case 'completed':
      return todos.value.filter((todo) => todo.completed);
    default:
      return todos.value;
  }
});

export const activeCount = derived(
  () => todos.value.filter((todo) => !todo.completed).length
);

export const completedCount = derived(
  () => todos.value.filter((todo) => todo.completed).length
);

// Actions
function setNewTodo(text: string) {
  newTodo.value = text;
}

function setFilter(newFilter: 'all' | 'active' | 'completed') {
  filter.value = newFilter;
}

function addTodo() {
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
}

function toggleTodo(id: number) {
  todos.value = todos.value.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
}

function removeTodo(id: number) {
  todos.value = todos.value.filter((todo) => todo.id !== id);
}

function clearCompleted() {
  todos.value = todos.value.filter((todo) => !todo.completed);
}

function toggleAll() {
  const allCompleted = todos.value.every((todo) => todo.completed);
  todos.value = todos.value.map((todo) => ({
    ...todo,
    completed: !allCompleted,
  }));
}

// Export as default
export default {
  todos,
  filter,
  newTodo,
  filteredTodos,
  activeCount,
  completedCount,
  setNewTodo,
  setFilter,
  addTodo,
  toggleTodo,
  removeTodo,
  clearCompleted,
  toggleAll,
};
