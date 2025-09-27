const completedTodos = derived(() => todos.filter(todo => todo.completed));

const todoStats = derived(() => ({
  total: todos.length,
  completed: completedTodos.value.length,
  pending: todos.length - completedTodos.value.length,
}));
