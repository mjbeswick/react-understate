import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const StorePattern: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Store Pattern</h1>
        <p className={styles.subtitle}>
          Organize related state, actions, and derived values in a single module
        </p>
      </header>

      <h2>Overview</h2>
      <p>
        The Store Pattern is a fundamental architecture pattern in React
        Understate that groups related state, derived values, and actions into a
        single module. This pattern provides clear separation of concerns, makes
        code more maintainable, and creates reusable business logic.
      </p>

      <div
        className="pattern-benefits"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Benefits</h3>
        <ul style={{ margin: 0 }}>
          <li>Clear separation of concerns</li>
          <li>Reusable business logic</li>
          <li>Easy to test and reason about</li>
          <li>Excellent TypeScript support</li>
          <li>Automatic optimization and batching</li>
        </ul>
      </div>

      <h2>Basic Store Structure</h2>
      <p>
        A typical store module exports state variables, derived values, and
        actions. Here's the basic structure:
      </p>

      <CodeBlock
        language="tsx"
        code={`// store.ts
import { state, derived, action } from 'react-understate';

// State variables
const count = state(0, 'count');
const multiplier = state(2, 'multiplier');

// Derived values
export const result = derived(() => count.value * multiplier.value, 'result');

// Actions
export const increment = action(() => {
  count.value++;
}, 'increment');

export const setCount = action((value: number) => {
  count.value = value;
}, 'setCount');

export const setMultiplier = action((value: number) => {
  multiplier.value = value;
}, 'setMultiplier');

// Export the store object
export const counterStore = {
  // State access
  count,
  multiplier,
  
  // Computed values
  result,
  
  // Actions
  increment,
  setCount,
  setMultiplier,
};`}
      />

      <h2>Real-World Example: Todo Store</h2>
      <p>
        Here's a complete todo store based on a real application, showing how to
        organize complex state with multiple derived values and actions:
      </p>

      <CodeBlock
        language="tsx"
        code={`// todoStore.ts
import {
  state,
  derived,
  action,
  persistLocalStorage,
} from 'react-understate';

// Types
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

export type FilterType = 'all' | 'active' | 'completed';

// State variables
const todos = state<Todo[]>([], 'todos');
const filter = state<FilterType>('all', 'todosFilter');
const newTodo = state('', 'newTodo');

// Persistence
persistLocalStorage(todos, 'todos');
persistLocalStorage(filter, 'todos-filter');

// Derived values
export const filteredTodos = derived(() => {
  switch (filter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed);
    case 'completed':
      return todos.value.filter(todo => todo.completed);
    default:
      return todos.value;
  }
}, 'filteredTodos');

export const activeCount = derived(
  () => todos.value.filter(todo => !todo.completed).length,
  'activeCount',
);

export const completedCount = derived(
  () => todos.value.filter(todo => todo.completed).length,
  'completedCount',
);

export const totalCount = derived(() => todos.value.length, 'totalCount');

export const hasCompletedTodos = derived(
  () => completedCount.value > 0,
  'hasCompletedTodos',
);

export const allCompleted = derived(
  () => totalCount.value > 0 && activeCount.value === 0,
  'allCompleted',
);

// Actions
export const setNewTodo = action((text: string) => {
  newTodo.value = text;
}, 'setNewTodo');

export const setFilter = action((newFilter: FilterType) => {
  filter.value = newFilter;
}, 'setFilter');

export const addTodo = action(() => {
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
}, 'addTodo');

export const toggleTodo = action((id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
}, 'toggleTodo');

export const removeTodo = action((id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
}, 'removeTodo');

export const updateTodo = action((id: number, text: string) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, text } : todo,
  );
}, 'updateTodo');

export const clearCompleted = action(() => {
  todos.value = todos.value.filter(todo => !todo.completed);
}, 'clearCompleted');

export const toggleAll = action(() => {
  const shouldComplete = !allCompleted.value;
  todos.value = todos.value.map(todo => ({
    ...todo,
    completed: shouldComplete,
  }));
}, 'toggleAll');

// Export the complete store
export const todoStore = {
  // State access
  todos,
  filter,
  newTodo,
  
  // Computed values
  filteredTodos,
  activeCount,
  completedCount,
  totalCount,
  hasCompletedTodos,
  allCompleted,
  
  // Actions
  setNewTodo,
  setFilter,
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  clearCompleted,
  toggleAll,
};`}
      />

      <h2>Using the Store in Components</h2>
      <p>
        With the store pattern, components become simple and focused on
        rendering. All business logic is contained in the store:
      </p>

      <CodeBlock
        language="tsx"
        code={`// TodoApp.tsx
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
            onChange={(e) => setNewTodo(e.target.value)}
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
          <button onClick={clearCompleted}>
            Clear completed
          </button>
        )}
      </footer>
    </div>
  );
}`}
      />

      <h2>Store Composition</h2>
      <p>
        For larger applications, you can compose multiple stores together. This
        allows you to organize code by feature or domain:
      </p>

      <CodeBlock
        language="tsx"
        code={`// Compose multiple stores
import { todoStore } from './todoStore';
import { userStore } from './userStore';
import { settingsStore } from './settingsStore';

// Create a root store that combines all features
export const appStore = {
  ...todoStore,
  ...userStore,
  ...settingsStore,
};

// Or organize by namespaces
export const appStore = {
  todos: todoStore,
  user: userStore,
  settings: settingsStore,
};

// Usage in component
function App() {
  const { todos, user, settings } = useUnderstate(appStore);
  // ... component logic
}`}
      />

      <h2>Advanced Patterns</h2>

      <h3>Conditional Actions</h3>
      <p>Actions can include business logic and conditionals:</p>

      <CodeBlock
        language="tsx"
        code={`export const addTodoWithValidation = action((text: string) => {
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
}, 'addTodoWithValidation');`}
      />

      <h3>Async Actions</h3>
      <p>Handle async operations within actions:</p>

      <CodeBlock
        language="tsx"
        code={`export const saveTodoToServer = action(async (todo: Todo) => {
  try {
    // Optimistic update
    todos.value = [...todos.value, todo];
    
    // Save to server
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save todo');
    }
    
    const savedTodo = await response.json();
    
    // Update with server response
    todos.value = todos.value.map(t => 
      t.id === todo.id ? savedTodo : t
    );
    
  } catch (error) {
    // Rollback on error
    todos.value = todos.value.filter(t => t.id !== todo.id);
    console.error('Failed to save todo:', error);
  }
}, 'saveTodoToServer');`}
      />

      <h2>Testing Stores</h2>
      <p>Stores are easy to test since they're just functions and state:</p>

      <CodeBlock
        language="tsx"
        code={`// todoStore.test.ts
import { todoStore } from './todoStore';

describe('Todo Store', () => {
  beforeEach(() => {
    // Reset state before each test
    todoStore.todos.value = [];
    todoStore.filter.value = 'all';
    todoStore.newTodo.value = '';
  });

  test('adds a todo', () => {
    todoStore.setNewTodo('Learn React Understate');
    todoStore.addTodo();
    
    expect(todoStore.todos.value).toHaveLength(1);
    expect(todoStore.todos.value[0].text).toBe('Learn React Understate');
    expect(todoStore.newTodo.value).toBe('');
  });

  test('filters todos correctly', () => {
    // Add some todos
    todoStore.setNewTodo('Active todo');
    todoStore.addTodo();
    
    todoStore.setNewTodo('Completed todo');
    todoStore.addTodo();
    todoStore.toggleTodo(todoStore.todos.value[1].id);
    
    // Test filtering
    todoStore.setFilter('active');
    expect(todoStore.filteredTodos.value).toHaveLength(1);
    expect(todoStore.filteredTodos.value[0].completed).toBe(false);
    
    todoStore.setFilter('completed');
    expect(todoStore.filteredTodos.value).toHaveLength(1);
    expect(todoStore.filteredTodos.value[0].completed).toBe(true);
  });

  test('computes statistics correctly', () => {
    // Add mixed todos
    todoStore.setNewTodo('Todo 1');
    todoStore.addTodo();
    todoStore.setNewTodo('Todo 2');
    todoStore.addTodo();
    
    // Complete one
    todoStore.toggleTodo(todoStore.todos.value[0].id);
    
    expect(todoStore.totalCount.value).toBe(2);
    expect(todoStore.activeCount.value).toBe(1);
    expect(todoStore.completedCount.value).toBe(1);
    expect(todoStore.hasCompletedTodos.value).toBe(true);
  });
});`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Keep stores focused:</strong> Each store should handle a
          single domain or feature
        </li>
        <li>
          <strong>Use TypeScript:</strong> Define clear types for your state and
          actions
        </li>
        <li>
          <strong>Name everything:</strong> Provide debug names for better
          development experience
        </li>
        <li>
          <strong>Group related logic:</strong> Keep related state, derived
          values, and actions together
        </li>
        <li>
          <strong>Export selectively:</strong> Only export what components need
          to use
        </li>
        <li>
          <strong>Test thoroughly:</strong> Stores contain your business logic,
          so test them well
        </li>
        <li>
          <strong>Use persistence wisely:</strong> Only persist state that
          should survive page reloads
        </li>
      </ul>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/patterns" className={styles.navLink}>
            ← Patterns Index
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/patterns/state-composition" className={styles.navLink}>
            State Composition →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StorePattern;
