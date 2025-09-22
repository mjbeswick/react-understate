import { state, derived, useUnderstate, action } from 'react-understate';

// Complex store with multiple states and computed values
const todoStore = {
  // States
  todos: state<Todo[]>([], 'todos'),
  filter: state<'all' | 'active' | 'completed'>('all', 'filter'),
  newTodoText: state('', 'newTodoText'),
  
  // Derived values
  filteredTodos: derived(() => {
    const todos = todoStore.todos.value;
    switch (todoStore.filter.value) {
      case 'active': return todos.filter(todo => !todo.completed);
      case 'completed': return todos.filter(todo => todo.completed);
      default: return todos;
    }
  }, 'filteredTodos'),
  
  todoStats: derived(() => {
    const todos = todoStore.todos.value;
    return {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      active: todos.filter(todo => !todo.completed).length
    };
  }, 'todoStats'),
  
  // Actions
  addTodo: action(() => {
    if (todoStore.newTodoText.value.trim()) {
      todoStore.todos.value = [
        ...todoStore.todos.value,
        {
          id: Date.now(),
          text: todoStore.newTodoText.value.trim(),
          completed: false
        }
      ];
      todoStore.newTodoText.value = '';
    }
  }, 'addTodo'),
  
  toggleTodo: action((id: number) => {
    todoStore.todos.value = todoStore.todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }, 'toggleTodo'),
  
  setFilter: action((newFilter: typeof todoStore.filter.value) => {
    todoStore.filter.value = newFilter;
  }, 'setFilter')
};

function TodoApp() {
  // Get all current values in one call
  const {
    filteredTodos,
    todoStats,
    newTodoText,
    addTodo,
    toggleTodo,
    setFilter,
    filter
  } = useUnderstate(todoStore);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };
  
  return (
    <div>
      <h1>Todos ({todoStats.active} active, {todoStats.completed} completed)</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          value={newTodoText}
          onChange={(e) => todoStore.newTodoText.value = e.target.value}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>
      
      <div>
        <button 
          onClick={() => setFilter('all')}
          style={{ fontWeight: filter === 'all' ? 'bold' : 'normal' }}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          style={{ fontWeight: filter === 'active' ? 'bold' : 'normal' }}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          style={{ fontWeight: filter === 'completed' ? 'bold' : 'normal' }}
        >
          Completed
        </button>
      </div>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}