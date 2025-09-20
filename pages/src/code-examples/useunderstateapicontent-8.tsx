import React, { memo, useCallback } from 'react';
import { state, useUnderstate, action } from 'react-understate';

const todoStore = {
  todos: state<Todo[]>([], 'todos'),
  toggleTodo: action((id: number) => {
    todoStore.todos.value = todoStore.todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }, 'toggleTodo')
};

// Memoized todo item component
const TodoItem = memo<{ todo: Todo; onToggle: (id: number) => void }>(
  ({ todo, onToggle }) => {
    console.log(`Rendering todo: ${todo.text}`);
    
    return (
      <li>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span style={{
          textDecoration: todo.completed ? 'line-through' : 'none'
        }}>
          {todo.text}
        </span>
      </li>
    );
  }
);

function TodoList() {
  const { todos, toggleTodo } = useUnderstate(todoStore);
  
  // Actions are stable references, so useCallback is not needed
  // But you can use it for consistency with other React patterns
  const handleToggle = useCallback((id: number) => {
    toggleTodo(id);
  }, [toggleTodo]);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={handleToggle} 
        />
      ))}
    </ul>
  );
}