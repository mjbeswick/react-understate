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
