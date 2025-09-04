import { createRoot } from 'react-dom/client';
import { useUnderstate } from 'react-understate';
import clsx from 'clsx';
import styles from './styles.module.css';
import * as store from './store';

function TodoApp() {
  const {
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
  } = useUnderstate(store);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>todos</h1>
        <div className={styles.inputContainer}>
          <input
            className={styles.newTodo}
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>
      </header>

      {todos.length > 0 && (
        <section className={styles.main}>
          <div className={styles.toggleAllContainer}>
            <input
              id="toggle-all"
              className={styles.toggleAll}
              type="checkbox"
              checked={todos.every(todo => todo.completed)}
              onChange={toggleAll}
            />
            <label htmlFor="toggle-all">Mark all as complete</label>
          </div>

          <ul className={styles.todoList}>
            {filteredTodos.map(todo => (
              <li
                key={todo.id}
                className={clsx(
                  styles.todoItem,
                  styles.completed && todo.completed,
                )}
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

      {todos.length > 0 && (
        <footer className={styles.footer}>
          <span className={styles.todoCount}>
            <strong>{activeCount}</strong>{' '}
            {activeCount === 1 ? 'item' : 'items'} left
          </span>

          <ul className={styles.filters}>
            <li>
              <button
                className={clsx(styles.selected && filter === 'all')}
                onClick={() => setFilter('all')}
              >
                All
              </button>
            </li>
            <li>
              <button
                className={clsx(styles.selected && filter === 'active')}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
            </li>
            <li>
              <button
                className={clsx(styles.selected && filter === 'completed')}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </li>
          </ul>

          {completedCount > 0 && (
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
