import { createRoot } from 'react-dom/client';
import { signal, derived, useSubscribe } from 'react-understate';
import styles from './styles.module.css';

// Define the Todo type
type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

// State
const todos = signal<Todo[]>([]);
const filter = signal<'all' | 'active' | 'completed'>('all');
const newTodo = signal('');

// Computed values
const filteredTodos = derived(() => {
  const allTodos = todos.value;
  const currentFilter = filter.value;

  switch (currentFilter) {
    case 'active':
      return allTodos.filter((todo) => !todo.completed);
    case 'completed':
      return allTodos.filter((todo) => todo.completed);
    default:
      return allTodos;
  }
});

const activeCount = derived(
  () => todos.value.filter((todo) => !todo.completed).length
);

const completedCount = derived(
  () => todos.value.filter((todo) => todo.completed).length
);

function TodoApp() {
  useSubscribe(todos);
  useSubscribe(filter);
  useSubscribe(newTodo);
  useSubscribe(filteredTodos);
  useSubscribe(activeCount);
  useSubscribe(completedCount);

  const addTodo = () => {
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
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const removeTodo = (id: number) => {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  };

  const clearCompleted = () => {
    todos.value = todos.value.filter((todo) => !todo.completed);
  };

  const toggleAll = () => {
    const allCompleted = todos.value.every((todo) => todo.completed);
    todos.value = todos.value.map((todo) => ({
      ...todo,
      completed: !allCompleted,
    }));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>todos</h1>
        <div className={styles.inputContainer}>
          <input
            className={styles.newTodo}
            value={newTodo.value}
            onChange={(e) => (newTodo.value = e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>
      </header>

      {todos.value.length > 0 && (
        <section className={styles.main}>
          <div className={styles.toggleAllContainer}>
            <input
              id="toggle-all"
              className={styles.toggleAll}
              type="checkbox"
              checked={todos.value.every((todo) => todo.completed)}
              onChange={toggleAll}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
          </div>

          <ul className={styles.todoList}>
            {filteredTodos.value.map((todo) => (
              <li
                key={todo.id}
                className={`${styles.todoItem} ${
                  todo.completed ? styles.completed : ''
                }`}
              >
                <div className={styles.view}>
                  <input
                    className={styles.toggle}
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <label className={styles.todoText}>{todo.text}</label>
                  <button
                    className={styles.destroy}
                    onClick={() => removeTodo(todo.id)}
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {todos.value.length > 0 && (
        <footer className={styles.footer}>
          <span className={styles.todoCount}>
            <strong>{activeCount.value}</strong>{' '}
            {activeCount.value === 1 ? 'item' : 'items'} left
          </span>

          <ul className={styles.filters}>
            <li>
              <button
                className={filter.value === 'all' ? styles.selected : ''}
                onClick={() => (filter.value = 'all')}
              >
                All
              </button>
            </li>
            <li>
              <button
                className={filter.value === 'active' ? styles.selected : ''}
                onClick={() => (filter.value = 'active')}
              >
                Active
              </button>
            </li>
            <li>
              <button
                className={filter.value === 'completed' ? styles.selected : ''}
                onClick={() => (filter.value = 'completed')}
              >
                Completed
              </button>
            </li>
          </ul>

          {completedCount.value > 0 && (
            <button className={styles.clearCompleted} onClick={clearCompleted}>
              Clear completed
            </button>
          )}
        </footer>
      )}
    </div>
  );
}

// Mount the app
const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<TodoApp />);
}
