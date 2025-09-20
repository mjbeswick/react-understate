import React from 'react';
import { arrayState, useUnderstate } from 'react-understate';

// Create array state for a todo list
const todos = arrayState<string>(['Learn React', 'Build app'], {
  name: 'todos',
});

// Derived value for todo count
const todoCount = () => todos.length;

// Actions for todo operations
const addTodo = (text: string) => {
  todos.push(text);
};

const removeTodo = (index: number) => {
  todos.splice(index, 1);
};

const clearTodos = () => {
  todos.clear();
};

// React component
function TodoList() {
  const [todoItems] = useUnderstate(todos);
  const [count] = useUnderstate({ todoCount });

  return (
    <div>
      <h3>Todo List ({count} items)</h3>

      <div>
        <input
          type="text"
          placeholder="Add a todo..."
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                addTodo(input.value.trim());
                input.value = '';
              }
            }
          }}
        />
        <button onClick={clearTodos}>Clear All</button>
      </div>

      <ul>
        {todoItems.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>Remove</button>
          </li>
        ))}
      </ul>

      {todoItems.length === 0 && <p>No todos yet. Add one above!</p>}
    </div>
  );
}

export { TodoList, addTodo, removeTodo, clearTodos };

