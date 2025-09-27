export const addTodoWithValidation = action((text: string) => {
  // Validation logic
  if (!text.trim()) {
    console.warn('Cannot add empty todo');
    return;
  }

  if (text.length > 100) {
    console.warn('Todo text too long');
    return;
  }

  // Check for duplicates
  if (todos.value.some(todo => todo.text === text.trim())) {
    console.warn('Todo already exists');
    return;
  }

  // Add the todo
  todos.value = [
    ...todos.value,
    {
      id: Date.now(),
      text: text.trim(),
      completed: false,
    },
  ];

  // Clear input
  newTodo.value = '';
}, 'addTodoWithValidation');
