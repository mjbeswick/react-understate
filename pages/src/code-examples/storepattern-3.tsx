// TodoApp.tsx
import React from 'react';
import { useUnderstate } from 'react-understate';
import { todoStore } from './todoStore';

function TodoApp() {
  const {
    filteredTodos,
    newTodo,
    activeCount,
    hasCompletedTodos,
    filter,
    addTodo,
    setNewTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    clearCompleted,
    toggleAll,
  } = useUnderstate(todoStore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  return (
    <div className="todo-app">
      <header>
        <h1>Todos</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
          />
        </form>
      </header>

      <main>
        {filteredTodos.length > 0 && (
          <button onClick={toggleAll}>
            {allCompleted ? '☑️' : '☐'} Toggle All
          </button>
        )}

        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => removeTodo(todo.id)}>×</button>
            </li>
          ))}
        </ul>
      </main>

      <footer>
        <span>{activeCount} items left</span>

        <div className="filters">
          {(['all', 'active', 'completed'] as const).map(filterType => (
            <button
              key={filterType}
              className={filter === filterType ? 'active' : ''}
              onClick={() => setFilter(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {hasCompletedTodos && (
          <button onClick={clearCompleted}>Clear completed</button>
        )}
      </footer>
    </div>
  );
}
