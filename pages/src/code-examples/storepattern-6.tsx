export const saveTodoToServer = action(async (todo: Todo) => {
  try {
    // Optimistic update
    todos.value = [...todos.value, todo];

    // Save to server
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });

    if (!response.ok) {
      throw new Error('Failed to save todo');
    }

    const savedTodo = await response.json();

    // Update with server response
    todos.value = todos.value.map(t => (t.id === todo.id ? savedTodo : t));
  } catch (error) {
    // Rollback on error
    todos.value = todos.value.filter(t => t.id !== todo.id);
    console.error('Failed to save todo:', error);
  }
}, 'saveTodoToServer');
