import { state, action, useUnderstate } from 'react-understate';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
};

const todos = state<Todo[]>([]);
const newTodoText = state('');

// Actions for todo management
const addTodo = action(() => {
  if (newTodoText.value.trim()) {
    todos.value = [
      ...todos.value,
      {
        id: Date.now(),
        text: newTodoText.value.trim(),
        completed: false,
        createdAt: new Date(),
      },
    ];
    newTodoText.value = '';
  }
}, 'addTodo');

const toggleTodo = action((id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}, 'toggleTodo');

const removeTodo = action((id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
}, 'removeTodo');

const clearCompleted = action(() => {
  todos.value = todos.value.filter(todo => !todo.completed);
}, 'clearCompleted');

const updateTodoText = action((id: number, newText: string) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, text: newText } : todo,
  );
}, 'updateTodoText');

function TodoApp() {
  const { todos: todoList, newTodoText: newText } = useUnderstate({
    todos,
    newTodoText,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={newText}
          onChange={e => (newTodoText.value = e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todoList.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {todoList.some(todo => todo.completed) && (
        <button onClick={clearCompleted}>Clear Completed</button>
      )}
    </div>
  );
}
