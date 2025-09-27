import { state, useUnderstate } from 'react-understate';

// Object state
const user = state({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
});

// Array state
const todos = state([
  { id: 1, text: 'Learn React Understate', completed: false },
  { id: 2, text: 'Build awesome app', completed: false },
]);

function UserProfile() {
  const [currentUser] = useUnderstate(user);
  const [currentTodos] = useUnderstate(todos);

  const updateTheme = () => {
    user.value = {
      ...user.value,
      preferences: {
        ...user.value.preferences,
        theme: user.value.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    };
  };

  const addTodo = (text: string) => {
    todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
  };

  return (
    <div>
      <h2>{currentUser.name}</h2>
      <p>Theme: {currentUser.preferences.theme}</p>
      <button onClick={updateTheme}>Toggle Theme</button>

      <h3>Todos ({currentTodos.length})</h3>
      {currentTodos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
