import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';

const UseUnderstateAPIContent: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>useUnderstate()</h1>
        <p className={styles.subtitle}>
          React hook for subscribing to state changes
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signatures</h2>
        <div className={styles.apiSignature}>
          {/* Store object pattern */}
          useUnderstate&lt;T&gt;(store: T): ExtractStateValues&lt;T&gt;
          <br />
          {/* Individual states pattern */}
          useUnderstate&lt;T&gt;(...states: State&lt;T&gt;[]): T[]
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>store</span>
            <span className={styles.parameterType}>T (Store Object)</span>
            <div className={styles.parameterDescription}>
              An object containing state variables, derived values, and action
              functions. The hook extracts current values from State objects and
              returns them along with non-state properties.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>...states</span>
            <span className={styles.parameterType}>State&lt;T&gt;[]</span>
            <div className={styles.parameterDescription}>
              Individual state variables to subscribe to. Returns an array of
              current values in the same order as the parameters.
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>useUnderstate()</code> hook is the React integration for React
        Understate. It subscribes React components to state changes and triggers
        re-renders when any subscribed state changes. Built on{' '}
        <code>useSyncExternalStore</code> for optimal React 18+ performance and
        concurrent rendering support.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔄 Automatic Subscriptions</div>
          <div className={styles.featureDescription}>
            Automatically subscribes to all State objects in the provided store
            or parameters.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>⚡ Optimal Performance</div>
          <div className={styles.featureDescription}>
            Uses useSyncExternalStore for concurrent rendering support and
            prevents tearing.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧹 Automatic Cleanup</div>
          <div className={styles.featureDescription}>
            Automatically unsubscribes when components unmount. No manual
            cleanup needed.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Type Safe</div>
          <div className={styles.featureDescription}>
            Full TypeScript support with automatic type inference for all
            patterns.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Store Object Pattern (Recommended)</h2>
        <p>
          The store object pattern is the recommended approach. Pass an object
          containing states, derived values, and actions, and get back the
          current values.
        </p>

        <h3>Basic Store Usage</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, useUnderstate, action } from 'react-understate';

// Create a store object
const counterStore = {
  count: state(0, 'count'),
  increment: action(() => {
    counterStore.count.value++;
  }, 'increment'),
  decrement: action(() => {
    counterStore.count.value--;
  }, 'decrement'),
  reset: action(() => {
    counterStore.count.value = 0;
  }, 'reset')
};

function Counter() {
  // Extract current values and actions
  const { count, increment, decrement, reset } = useUnderstate(counterStore);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`}
        />

        <h3>Complex Store with Derived Values</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, derived, useUnderstate, action } from 'react-understate';

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
}`}
        />

        <h3>Partial Store Subscription</h3>
        <CodeBlock
          language="tsx"
          code={`// Large store with many states
const appStore = {
  user: state(null, 'user'),
  theme: state('light', 'theme'),
  notifications: state([], 'notifications'),
  settings: state({}, 'settings'),
  
  // ... many more states and actions
  updateTheme: action((theme: string) => {
    appStore.theme.value = theme;
  }, 'updateTheme')
};

// Component only subscribes to what it needs
function ThemeToggle() {
  // Only subscribes to theme and updateTheme - not other states
  const { theme, updateTheme } = useUnderstate({
    theme: appStore.theme,
    updateTheme: appStore.updateTheme
  });
  
  return (
    <button onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}

// Another component subscribes to different parts
function UserProfile() {
  // Only subscribes to user state
  const { user } = useUnderstate({
    user: appStore.user
  });
  
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.name}!</div>;
}`}
        />
      </div>

      <h2>Individual States Pattern</h2>
      <p>
        Alternative pattern for subscribing to individual states. Returns an
        array of current values in parameter order.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, useUnderstate } from 'react-understate';

const count = state(0, 'count');
const name = state('John', 'name');
const isLoading = state(false, 'isLoading');

function UserDisplay() {
  // Array destructuring - order matches parameters
  const [currentCount, currentName, loading] = useUnderstate(count, name, isLoading);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{currentName}</h2>
      <p>Count: {currentCount}</p>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => name.value = 'Jane'}>Change Name</button>
    </div>
  );
}

// Single state subscription
function SimpleCounter() {
  const [currentCount] = useUnderstate(count);
  
  return (
    <div>
      Count: {currentCount}
      <button onClick={() => count.value++}>+</button>
    </div>
  );
}`}
      />

      <h2>Advanced Patterns</h2>

      <h3>Conditional Subscriptions</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, useUnderstate } from 'react-understate';

const user = state(null, 'user');
const userSettings = state(null, 'userSettings');
const publicData = state({}, 'publicData');

function Dashboard() {
  const { user: currentUser } = useUnderstate({ user });
  
  // Conditional subscription based on auth state
  if (!currentUser) {
    // Only subscribe to public data when not logged in
    const { publicData: data } = useUnderstate({ publicData });
    
    return (
      <div>
        <h1>Public Dashboard</h1>
        <div>Public info: {JSON.stringify(data)}</div>
        <button onClick={() => user.value = { id: 1, name: 'John' }}>
          Log In
        </button>
      </div>
    );
  }
  
  // Subscribe to user-specific data when logged in
  const { userSettings: settings } = useUnderstate({ userSettings });
  
  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      <div>Settings: {JSON.stringify(settings)}</div>
      <button onClick={() => user.value = null}>Log Out</button>
    </div>
  );
}`}
      />

      <h3>Custom Hooks with useUnderstate</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, derived, useUnderstate, action } from 'react-understate';

// Shopping cart store
const cartStore = {
  items: state<CartItem[]>([], 'cartItems'),
  discountCode: state('', 'discountCode'),
  
  subtotal: derived(() => 
    cartStore.items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  , 'subtotal'),
  
  discount: derived(() => {
    const code = cartStore.discountCode.value;
    const subtotal = cartStore.subtotal.value;
    
    if (code === 'SAVE10') return subtotal * 0.1;
    if (code === 'SAVE20') return subtotal * 0.2;
    return 0;
  }, 'discount'),
  
  total: derived(() => 
    cartStore.subtotal.value - cartStore.discount.value
  , 'total'),
  
  addItem: action((item: CartItem) => {
    const existing = cartStore.items.value.find(i => i.id === item.id);
    if (existing) {
      cartStore.items.value = cartStore.items.value.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      cartStore.items.value = [...cartStore.items.value, { ...item, quantity: 1 }];
    }
  }, 'addItem'),
  
  removeItem: action((id: string) => {
    cartStore.items.value = cartStore.items.value.filter(item => item.id !== id);
  }, 'removeItem')
};

// Custom hook for cart functionality
function useShoppingCart() {
  const cart = useUnderstate(cartStore);
  
  return {
    ...cart,
    isEmpty: cart.items.length === 0,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    hasDiscount: cart.discount > 0
  };
}

// Custom hook for specific cart section
function useCartSummary() {
  const { subtotal, discount, total, hasDiscount } = useShoppingCart();
  
  return {
    subtotal,
    discount,
    total,
    hasDiscount,
    savings: discount,
    formattedTotal: \`$\${total.toFixed(2)}\`
  };
}

// Usage in components
function CartSummary() {
  const { subtotal, discount, formattedTotal, hasDiscount } = useCartSummary();
  
  return (
    <div>
      <p>Subtotal: \${subtotal.toFixed(2)}</p>
      {hasDiscount && <p>Discount: -\${discount.toFixed(2)}</p>}
      <h3>Total: {formattedTotal}</h3>
    </div>
  );
}

function ProductList() {
  const { addItem } = useShoppingCart();
  
  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>\${product.price}</p>
          <button onClick={() => addItem(product)}>
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}`}
      />

      <h3>Performance Optimization</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, derived, useUnderstate, action } from 'react-understate';

// Large application store
const appStore = {
  // User data
  user: state(null, 'user'),
  userPreferences: state({}, 'userPreferences'),
  userHistory: state([], 'userHistory'),
  
  // App data
  currentPage: state('home', 'currentPage'),
  sidebarOpen: state(false, 'sidebarOpen'),
  notifications: state([], 'notifications'),
  
  // Heavy computed data
  expensiveComputation: derived(() => {
    // Expensive calculation
    return computeExpensiveData(appStore.user.value);
  }, 'expensiveComputation'),
  
  // Actions
  toggleSidebar: action(() => {
    appStore.sidebarOpen.value = !appStore.sidebarOpen.value;
  }, 'toggleSidebar')
};

// ❌ Bad: Subscribes to entire store
function BadComponent() {
  // This component re-renders when ANY state changes
  const everything = useUnderstate(appStore);
  
  return <div>{everything.currentPage}</div>;
}

// ✅ Good: Subscribe only to needed states
function GoodComponent() {
  // Only subscribes to currentPage - no re-renders for other changes
  const { currentPage } = useUnderstate({
    currentPage: appStore.currentPage
  });
  
  return <div>{currentPage}</div>;
}

// ✅ Good: Separate components for different concerns
function UserInfo() {
  // Only subscribes to user-related states
  const { user, userPreferences } = useUnderstate({
    user: appStore.user,
    userPreferences: appStore.userPreferences
  });
  
  return <div>{user?.name} - Theme: {userPreferences.theme}</div>;
}

function Sidebar() {
  // Only subscribes to sidebar state
  const { sidebarOpen, toggleSidebar } = useUnderstate({
    sidebarOpen: appStore.sidebarOpen,
    toggleSidebar: appStore.toggleSidebar
  });
  
  return (
    <div className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
      {/* Sidebar content */}
    </div>
  );
}

// ✅ Good: Memoized expensive computation
function ExpensiveComponent() {
  const { expensiveComputation } = useUnderstate({
    expensiveComputation: appStore.expensiveComputation
  });
  
  // The derived value is memoized and only recalculates when user changes
  return <div>{expensiveComputation.result}</div>;
}`}
      />

      <h2>Integration with React Features</h2>

      <h3>React.memo and useCallback</h3>
      <CodeBlock
        language="tsx"
        code={`import React, { memo, useCallback } from 'react';
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
    console.log(\`Rendering todo: \${todo.text}\`);
    
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
}`}
      />

      <h3>Error Boundaries</h3>
      <CodeBlock
        language="tsx"
        code={`import React from 'react';
import { state, useUnderstate, action } from 'react-understate';

const errorStore = {
  hasError: state(false, 'hasError'),
  errorMessage: state('', 'errorMessage'),
  
  setError: action((message: string) => {
    errorStore.hasError.value = true;
    errorStore.errorMessage.value = message;
  }, 'setError'),
  
  clearError: action(() => {
    errorStore.hasError.value = false;
    errorStore.errorMessage.value = '';
  }, 'clearError')
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error) {
    // Report error to global error store
    errorStore.setError(error.message);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorDisplay />;
    }
    
    return this.props.children;
  }
}

function ErrorDisplay() {
  const { errorMessage, clearError } = useUnderstate(errorStore);
  
  return (
    <div style={{ padding: '20px', background: '#fee', border: '1px solid #f00' }}>
      <h2>Something went wrong!</h2>
      <p>{errorMessage}</p>
      <button onClick={clearError}>Try Again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <YourAppComponents />
    </ErrorBoundary>
  );
}`}
      />

      <h2>TypeScript Integration</h2>

      <h3>Type-Safe Store Patterns</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, derived, useUnderstate, action } from 'react-understate';

// Define your types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AppState {
  currentUser: User | null;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}

// Type-safe store
const appStore = {
  // Explicitly typed states
  user: state<User | null>(null, 'user'),
  theme: state<AppState['theme']>('light', 'theme'),
  language: state<AppState['language']>('en', 'language'),
  
  // Derived values with inferred types
  isAdmin: derived(() => {
    return appStore.user.value?.role === 'admin';
  }, 'isAdmin'),
  
  userDisplayName: derived(() => {
    const user = appStore.user.value;
    return user ? \`\${user.name} (\${user.email})\` : 'Guest';
  }, 'userDisplayName'),
  
  // Type-safe actions
  setUser: action((user: User) => {
    appStore.user.value = user;
  }, 'setUser'),
  
  logout: action(() => {
    appStore.user.value = null;
  }, 'logout'),
  
  updateTheme: action((theme: AppState['theme']) => {
    appStore.theme.value = theme;
  }, 'updateTheme')
} as const; // 'as const' for better type inference

// Type-safe component
function UserProfile() {
  // TypeScript infers all types automatically
  const { 
    user,           // User | null
    isAdmin,        // boolean
    userDisplayName, // string
    theme,          // 'light' | 'dark'
    setUser,        // (user: User) => void
    logout,         // () => void
    updateTheme     // (theme: 'light' | 'dark') => void
  } = useUnderstate(appStore);
  
  const handleLogin = () => {
    setUser({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });
  };
  
  return (
    <div>
      <h1>{userDisplayName}</h1>
      {user ? (
        <div>
          <p>Role: {user.role}</p>
          {isAdmin && <p>Admin privileges enabled</p>}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      
      <select 
        value={theme} 
        onChange={(e) => updateTheme(e.target.value as AppState['theme'])}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

// Generic store factory for reusable patterns
function createEntityStore<T extends { id: string | number }>() {
  return {
    entities: state<T[]>([], 'entities'),
    selectedId: state<T['id'] | null>(null, 'selectedId'),
    
    selectedEntity: derived(() => {
      const entities = createEntityStore<T>().entities.value;
      const id = createEntityStore<T>().selectedId.value;
      return entities.find(entity => entity.id === id) || null;
    }),
    
    addEntity: action((entity: T) => {
      const store = createEntityStore<T>();
      store.entities.value = [...store.entities.value, entity];
    }),
    
    selectEntity: action((id: T['id']) => {
      const store = createEntityStore<T>();
      store.selectedId.value = id;
    })
  };
}`}
      />

      <h2>Testing with useUnderstate</h2>
      <CodeBlock
        language="tsx"
        code={`import { render, screen, fireEvent } from '@testing-library/react';
import { state, useUnderstate, action } from 'react-understate';

// Test store
const testStore = {
  count: state(0, 'testCount'),
  increment: action(() => {
    testStore.count.value++;
  }, 'testIncrement')
};

// Component under test
function TestCounter() {
  const { count, increment } = useUnderstate(testStore);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={increment}>
        Increment
      </button>
    </div>
  );
}

describe('useUnderstate integration', () => {
  beforeEach(() => {
    // Reset state before each test
    testStore.count.value = 0;
  });
  
  it('should render current state value', () => {
    render(<TestCounter />);
    
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
  
  it('should update when state changes', () => {
    render(<TestCounter />);
    
    const incrementButton = screen.getByTestId('increment');
    fireEvent.click(incrementButton);
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
  
  it('should update when state changes externally', () => {
    render(<TestCounter />);
    
    // Update state outside component
    testStore.count.value = 42;
    
    expect(screen.getByTestId('count')).toHaveTextContent('42');
  });
  
  it('should handle multiple rapid updates', () => {
    render(<TestCounter />);
    
    const incrementButton = screen.getByTestId('increment');
    
    // Rapid clicks
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });
});`}
      />

      <h2>Best Practices</h2>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Subscribe Selectively</div>
          <div className={styles.featureDescription}>
            Only subscribe to states that the component actually uses to
            minimize re-renders.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>📦 Use Store Pattern</div>
          <div className={styles.featureDescription}>
            Prefer the store object pattern over individual state parameters for
            better organization.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔄 Stable References</div>
          <div className={styles.featureDescription}>
            Actions maintain stable references, making them safe to use in
            dependency arrays.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧪 Test Integration</div>
          <div className={styles.featureDescription}>
            Test components by verifying they respond correctly to state
            changes.
          </div>
        </div>
      </div>

      <h3>Do's and Don'ts</h3>
      <CodeBlock
        language="tsx"
        code={`// ✅ DO: Subscribe only to what you need
function GoodComponent() {
  const { user } = useUnderstate({ user: appStore.user });
  return <div>{user?.name}</div>;
}

// ❌ DON'T: Subscribe to entire large stores
function BadComponent() {
  const everything = useUnderstate(appStore); // Re-renders on any change
  return <div>{everything.user?.name}</div>;
}

// ✅ DO: Use custom hooks for reusable logic
function useAuth() {
  return useUnderstate({
    user: authStore.user,
    login: authStore.login,
    logout: authStore.logout
  });
}

// ✅ DO: Actions are stable - safe in dependency arrays
function GoodEffect() {
  const { loadData } = useUnderstate({ loadData: dataStore.loadData });
  
  useEffect(() => {
    loadData();
  }, [loadData]); // Safe - loadData reference is stable
}

// ❌ DON'T: Mutate state values directly
function BadMutation() {
  const { user } = useUnderstate({ user: userStore.user });
  
  const handleUpdate = () => {
    user.name = 'New Name'; // ❌ Direct mutation
    userStore.user.value = user; // ❌ Won't trigger updates
  };
}

// ✅ DO: Create new objects for updates
function GoodMutation() {
  const { user, updateUser } = useUnderstate({
    user: userStore.user,
    updateUser: userStore.updateUser
  });
  
  const handleUpdate = () => {
    updateUser({ ...user, name: 'New Name' }); // ✅ Proper update
  };
}`}
      />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/batch" className={styles.navLink}>
            ← batch()
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/examples/todo" className={styles.navLink}>
            Examples →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UseUnderstateAPIContent;
