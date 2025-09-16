import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const Testing: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Testing Guide</h1>
        <p className={styles.subtitle}>
          Comprehensive testing strategies for React Understate applications
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/testing" className={styles.navLink}>
            Testing
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        Testing React Understate applications requires understanding how to test
        state management, derived values, effects, and actions. This guide
        covers comprehensive testing strategies from unit tests to integration
        tests and end-to-end testing.
      </p>

      <div
        className="guide-overview"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>🎯 What You'll Learn</h3>
        <ul style={{ margin: 0 }}>
          <li>Testing state atoms and updates</li>
          <li>Testing derived values and computed state</li>
          <li>Testing actions and side effects</li>
          <li>Testing effects and cleanup</li>
          <li>Testing React components with useUnderstate</li>
          <li>Integration and end-to-end testing</li>
        </ul>
      </div>

      <h2>Testing State</h2>
      <p>
        State atoms are the foundation of React Understate. Testing them
        involves verifying initial values, updates, and state transitions.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action } from 'react-understate';

// Basic state testing
describe('State Testing', () => {
  test('should initialize with correct value', () => {
    const count = state(0, { name: 'count' });
    expect(count()).toBe(0);
  });

  test('should update value correctly', () => {
    const count = state(0, { name: 'count' });
    
    count(5);
    expect(count()).toBe(5);
    
    count(prev => prev + 1);
    expect(count()).toBe(6);
  });

  test('should handle object state updates', () => {
    const user = state({ name: '', email: '' }, { name: 'user' });
    
    user(prev => ({ ...prev, name: 'John' }));
    expect(user()).toEqual({ name: 'John', email: '' });
    
    user(prev => ({ ...prev, email: 'john@example.com' }));
    expect(user()).toEqual({ name: 'John', email: 'john@example.com' });
  });

  test('should handle array state updates', () => {
    const items = state<string[]>([], { name: 'items' });
    
    items(prev => [...prev, 'item1']);
    expect(items()).toEqual(['item1']);
    
    items(prev => [...prev, 'item2']);
    expect(items()).toEqual(['item1', 'item2']);
    
    items(prev => prev.filter(item => item !== 'item1'));
    expect(items()).toEqual(['item2']);
  });
});

// State with complex logic
describe('Complex State Logic', () => {
  test('should handle conditional updates', () => {
    const isLoggedIn = state(false, { name: 'isLoggedIn' });
    const user = state(null, { name: 'user' });
    
    const login = action((userData: any) => {
      isLoggedIn(true);
      user(userData);
    }, { name: 'login' });
    
    const logout = action(() => {
      isLoggedIn(false);
      user(null);
    }, { name: 'logout' });
    
    // Test login
    login({ id: 1, name: 'John' });
    expect(isLoggedIn()).toBe(true);
    expect(user()).toEqual({ id: 1, name: 'John' });
    
    // Test logout
    logout();
    expect(isLoggedIn()).toBe(false);
    expect(user()).toBe(null);
  });

  test('should handle state validation', () => {
    const email = state('', { name: 'email' });
    const isValidEmail = (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    
    const setEmail = action((newEmail: string) => {
      if (isValidEmail(newEmail)) {
        email(newEmail);
      } else {
        throw new Error('Invalid email format');
      }
    }, { name: 'setEmail' });
    
    // Test valid email
    setEmail('test@example.com');
    expect(email()).toBe('test@example.com');
    
    // Test invalid email
    expect(() => setEmail('invalid-email')).toThrow('Invalid email format');
    expect(email()).toBe('test@example.com'); // Should not change
  });
});`}
      />

      <h2>Testing Derived Values</h2>
      <p>
        Derived values are computed state that automatically update when
        dependencies change. Testing them requires verifying both the
        computation logic and dependency tracking.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Testing derived values
describe('Derived Values Testing', () => {
  test('should compute derived value correctly', () => {
    const firstName = state('John', { name: 'firstName' });
    const lastName = state('Doe', { name: 'lastName' });
    
    const fullName = derived(() => \`\${firstName()} \${lastName()}\`, {
      name: 'fullName',
    });
    
    expect(fullName()).toBe('John Doe');
  });

  test('should update when dependencies change', () => {
    const count = state(0, { name: 'count' });
    const multiplier = state(2, { name: 'multiplier' });
    
    const doubled = derived(() => count() * multiplier(), {
      name: 'doubled',
    });
    
    expect(doubled()).toBe(0);
    
    count(5);
    expect(doubled()).toBe(10);
    
    multiplier(3);
    expect(doubled()).toBe(15);
  });

  test('should handle complex derived logic', () => {
    const todos = state<Todo[]>([], { name: 'todos' });
    const filter = state('all', { name: 'filter' });
    
    const filteredTodos = derived(() => {
      const allTodos = todos();
      const currentFilter = filter();
      
      switch (currentFilter) {
        case 'active':
          return allTodos.filter(todo => !todo.completed);
        case 'completed':
          return allTodos.filter(todo => todo.completed);
        default:
          return allTodos;
      }
    }, { name: 'filteredTodos' });
    
    // Test with different filters
    todos([
      { id: '1', text: 'Todo 1', completed: false },
      { id: '2', text: 'Todo 2', completed: true },
    ]);
    
    expect(filteredTodos()).toHaveLength(2);
    
    filter('active');
    expect(filteredTodos()).toHaveLength(1);
    expect(filteredTodos()[0].text).toBe('Todo 1');
    
    filter('completed');
    expect(filteredTodos()).toHaveLength(1);
    expect(filteredTodos()[0].text).toBe('Todo 2');
  });

  test('should handle async derived values', async () => {
    const userId = state<number | null>(null, { name: 'userId' });
    
    const userData = derived(async () => {
      const id = userId();
      if (!id) return null;
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      return { id, name: \`User \${id}\` };
    }, { name: 'userData' });
    
    userId(1);
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const data = await userData();
    expect(data).toEqual({ id: 1, name: 'User 1' });
  });
});

// Testing derived value performance
describe('Derived Value Performance', () => {
  test('should not recalculate unnecessarily', () => {
    let calculationCount = 0;
    
    const base = state(0, { name: 'base' });
    const expensive = derived(() => {
      calculationCount++;
      return base() * 2;
    }, { name: 'expensive' });
    
    // Initial calculation
    expect(expensive()).toBe(0);
    expect(calculationCount).toBe(1);
    
    // Accessing without dependency change
    expect(expensive()).toBe(0);
    expect(calculationCount).toBe(1); // Should not recalculate
    
    // Dependency change
    base(5);
    expect(expensive()).toBe(10);
    expect(calculationCount).toBe(2); // Should recalculate
  });
});`}
      />

      <h2>Testing Actions</h2>
      <p>
        Actions encapsulate state mutations and side effects. Testing them
        involves verifying state changes, side effects, and error handling.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Testing actions
describe('Action Testing', () => {
  test('should update state correctly', () => {
    const count = state(0, { name: 'count' });
    
    const increment = action(() => {
      count(prev => prev + 1);
    }, { name: 'increment' });
    
    increment();
    expect(count()).toBe(1);
    
    increment();
    expect(count()).toBe(2);
  });

  test('should handle async actions', async () => {
    const data = state(null, { name: 'data' });
    const loading = state(false, { name: 'loading' });
    const error = state(null, { name: 'error' });
    
    const fetchData = action(async () => {
      loading(true);
      error(null);
      
      try {
        const result = await mockFetch('/api/data');
        data(result);
      } catch (err) {
        error(err.message);
      } finally {
        loading(false);
      }
    }, { name: 'fetchData' });
    
    // Mock fetch function
    const mockFetch = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });
    
    await fetchData();
    
    expect(loading()).toBe(false);
    expect(data()).toEqual({ id: 1, name: 'Test' });
    expect(error()).toBe(null);
  });

  test('should handle action errors', async () => {
    const error = state(null, { name: 'error' });
    
    const riskyAction = action(async () => {
      throw new Error('Something went wrong');
    }, { name: 'riskyAction' });
    
    await expect(riskyAction()).rejects.toThrow('Something went wrong');
  });

  test('should handle action composition', () => {
    const user = state(null, { name: 'user' });
    const isLoggedIn = state(false, { name: 'isLoggedIn' });
    
    const setUser = action((userData: any) => {
      user(userData);
    }, { name: 'setUser' });
    
    const login = action((userData: any) => {
      setUser(userData);
      isLoggedIn(true);
    }, { name: 'login' });
    
    login({ id: 1, name: 'John' });
    
    expect(user()).toEqual({ id: 1, name: 'John' });
    expect(isLoggedIn()).toBe(true);
  });
});

// Testing action side effects
describe('Action Side Effects', () => {
  test('should call external functions', () => {
    const mockCallback = jest.fn();
    const count = state(0, { name: 'count' });
    
    const incrementWithCallback = action(() => {
      count(prev => prev + 1);
      mockCallback(count());
    }, { name: 'incrementWithCallback' });
    
    incrementWithCallback();
    
    expect(mockCallback).toHaveBeenCalledWith(1);
    expect(count()).toBe(1);
  });

  test('should handle API calls', async () => {
    const mockApi = {
      save: jest.fn().mockResolvedValue({ id: 1 }),
      load: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    };
    
    const data = state(null, { name: 'data' });
    
    const saveData = action(async (dataToSave: any) => {
      const result = await mockApi.save(dataToSave);
      data(result);
    }, { name: 'saveData' });
    
    await saveData({ name: 'Test' });
    
    expect(mockApi.save).toHaveBeenCalledWith({ name: 'Test' });
    expect(data()).toEqual({ id: 1 });
  });
});`}
      />

      <h2>Testing Effects</h2>
      <p>
        Effects handle side effects and reactive logic. Testing them requires
        verifying execution, cleanup, and dependency tracking.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Testing effects
describe('Effect Testing', () => {
  test('should execute effect on dependency change', () => {
    const count = state(0, { name: 'count' });
    const effectSpy = jest.fn();
    
    const testEffect = effect(() => {
      effectSpy(count());
    }, { name: 'testEffect' });
    
    // Initial execution
    expect(effectSpy).toHaveBeenCalledWith(0);
    
    // Dependency change
    count(5);
    expect(effectSpy).toHaveBeenCalledWith(5);
    
    count(10);
    expect(effectSpy).toHaveBeenCalledWith(10);
  });

  test('should handle effect cleanup', () => {
    const isActive = state(true, { name: 'isActive' });
    const cleanupSpy = jest.fn();
    
    const testEffect = effect(() => {
      if (isActive()) {
        const interval = setInterval(() => {
          console.log('tick');
        }, 100);
        
        return () => {
          cleanupSpy();
          clearInterval(interval);
        };
      }
    }, { name: 'testEffect' });
    
    // Trigger cleanup
    isActive(false);
    
    // Wait for cleanup
    setTimeout(() => {
      expect(cleanupSpy).toHaveBeenCalled();
    }, 200);
  });

  test('should handle async effects', async () => {
    const userId = state<number | null>(null, { name: 'userId' });
    const userData = state(null, { name: 'userData' });
    
    const userEffect = effect(async () => {
      const id = userId();
      if (id) {
        const data = await mockFetchUser(id);
        userData(data);
      }
    }, { name: 'userEffect' });
    
    // Mock fetch function
    const mockFetchUser = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    
    userId(1);
    
    // Wait for async effect
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockFetchUser).toHaveBeenCalledWith(1);
    expect(userData()).toEqual({ id: 1, name: 'John' });
  });

  test('should handle effect errors', () => {
    const shouldError = state(false, { name: 'shouldError' });
    const errorSpy = jest.fn();
    
    const errorEffect = effect(() => {
      if (shouldError()) {
        throw new Error('Effect error');
      }
    }, { name: 'errorEffect' });
    
    // Mock console.error to catch error
    const originalError = console.error;
    console.error = errorSpy;
    
    shouldError(true);
    
    expect(errorSpy).toHaveBeenCalled();
    
    console.error = originalError;
  });
});

// Testing effect dependencies
describe('Effect Dependencies', () => {
  test('should only depend on accessed state', () => {
    const state1 = state(0, { name: 'state1' });
    const state2 = state(0, { name: 'state2' });
    const effectSpy = jest.fn();
    
    const selectiveEffect = effect(() => {
      // Only depends on state1
      effectSpy(state1());
    }, { name: 'selectiveEffect' });
    
    // Initial execution
    expect(effectSpy).toHaveBeenCalledWith(0);
    
    // Change state1 - should trigger
    state1(5);
    expect(effectSpy).toHaveBeenCalledWith(5);
    
    // Change state2 - should not trigger
    state2(10);
    expect(effectSpy).toHaveBeenCalledTimes(2); // Only initial + state1 change
  });
});`}
      />

      <h2>Testing React Components</h2>
      <p>
        Testing React components that use React Understate requires
        understanding how to test component state subscriptions and updates.
      </p>

      <CodeBlock
        language="typescript"
        code={`import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUnderstate } from 'react-understate';

// Test component
const Counter = () => {
  const count = useUnderstate(counterState);
  const increment = useUnderstate(incrementAction);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

// Testing React components
describe('React Component Testing', () => {
  beforeEach(() => {
    // Reset state before each test
    counterState(0);
  });

  test('should render initial state', () => {
    render(<Counter />);
    
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('should update when state changes', () => {
    render(<Counter />);
    
    // Update state directly
    counterState(5);
    
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  test('should handle user interactions', () => {
    render(<Counter />);
    
    const button = screen.getByText('Increment');
    fireEvent.click(button);
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  test('should handle multiple state subscriptions', () => {
    const MultiStateComponent = () => {
      const count = useUnderstate(counterState);
      const name = useUnderstate(nameState);
      
      return (
        <div>
          <span data-testid="count">{count}</span>
          <span data-testid="name">{name}</span>
        </div>
      );
    };
    
    render(<MultiStateComponent />);
    
    counterState(5);
    nameState('John');
    
    expect(screen.getByTestId('count')).toHaveTextContent('5');
    expect(screen.getByTestId('name')).toHaveTextContent('John');
  });
});

// Testing component with effects
describe('Component with Effects', () => {
  test('should handle effect cleanup on unmount', () => {
    const cleanupSpy = jest.fn();
    
    const EffectComponent = () => {
      const count = useUnderstate(counterState);
      
      React.useEffect(() => {
        const interval = setInterval(() => {
          console.log('tick');
        }, 100);
        
        return () => {
          cleanupSpy();
          clearInterval(interval);
        };
      }, [count]);
      
      return <div>{count}</div>;
    };
    
    const { unmount } = render(<EffectComponent />);
    
    // Unmount component
    unmount();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
});

// Testing async components
describe('Async Component Testing', () => {
  test('should handle async state updates', async () => {
    const AsyncComponent = () => {
      const data = useUnderstate(asyncDataState);
      const loading = useUnderstate(loadingState);
      
      if (loading) {
        return <div>Loading...</div>;
      }
      
      return <div data-testid="data">{data?.name}</div>;
    };
    
    render(<AsyncComponent />);
    
    // Trigger async update
    loadingState(true);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Simulate async completion
    await waitFor(() => {
      loadingState(false);
      asyncDataState({ name: 'Test Data' });
    });
    
    expect(screen.getByTestId('data')).toHaveTextContent('Test Data');
  });
});`}
      />

      <h2>Integration Testing</h2>
      <p>
        Integration tests verify that multiple parts of your application work
        together correctly.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Integration testing
describe('Integration Tests', () => {
  test('should handle complete user flow', async () => {
    // Setup
    const user = state(null, { name: 'user' });
    const isLoggedIn = state(false, { name: 'isLoggedIn' });
    const todos = state<Todo[]>([], { name: 'todos' });
    
    const login = action(async (credentials: any) => {
      const userData = await mockLogin(credentials);
      user(userData);
      isLoggedIn(true);
    }, { name: 'login' });
    
    const addTodo = action((text: string) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
      };
      todos(prev => [...prev, newTodo]);
    }, { name: 'addTodo' });
    
    const toggleTodo = action((id: string) => {
      todos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    }, { name: 'toggleTodo' });
    
    // Mock API
    const mockLogin = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    
    // Test complete flow
    await login({ email: 'john@example.com', password: 'password' });
    
    expect(isLoggedIn()).toBe(true);
    expect(user()).toEqual({ id: 1, name: 'John' });
    
    addTodo('Learn React Understate');
    addTodo('Write tests');
    
    expect(todos()).toHaveLength(2);
    expect(todos()[0].text).toBe('Learn React Understate');
    
    toggleTodo(todos()[0].id);
    
    expect(todos()[0].completed).toBe(true);
    expect(todos()[1].completed).toBe(false);
  });

  test('should handle state persistence', () => {
    // Setup persistence
    const settings = state({
      theme: 'light',
      language: 'en',
    }, { name: 'settings' });
    
    const saveSettings = action((newSettings: any) => {
      settings(newSettings);
      localStorage.setItem('settings', JSON.stringify(newSettings));
    }, { name: 'saveSettings' });
    
    const loadSettings = action(() => {
      const saved = localStorage.getItem('settings');
      if (saved) {
        settings(JSON.parse(saved));
      }
    }, { name: 'loadSettings' });
    
    // Test save
    saveSettings({ theme: 'dark', language: 'es' });
    
    expect(settings()).toEqual({ theme: 'dark', language: 'es' });
    expect(localStorage.getItem('settings')).toBe(
      JSON.stringify({ theme: 'dark', language: 'es' })
    );
    
    // Test load
    settings({ theme: 'light', language: 'en' }); // Reset
    loadSettings();
    
    expect(settings()).toEqual({ theme: 'dark', language: 'es' });
  });
});

// Testing error boundaries
describe('Error Boundary Testing', () => {
  test('should handle state errors gracefully', () => {
    const errorState = state(null, { name: 'errorState' });
    
    const riskyAction = action(() => {
      throw new Error('State error');
    }, { name: 'riskyAction' });
    
    // Mock error boundary
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      const [hasError, setHasError] = React.useState(false);
      
      React.useEffect(() => {
        const handleError = () => setHasError(true);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);
      
      if (hasError) {
        return <div>Error occurred</div>;
      }
      
      return <>{children}</>;
    };
    
    const TestComponent = () => {
      const count = useUnderstate(counterState);
      
      return (
        <div>
          <span>{count}</span>
          <button onClick={riskyAction}>Risky Action</button>
        </div>
      );
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Risky Action'));
    
    // Error should be caught by boundary
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});`}
      />

      <h2>Testing Utilities</h2>
      <p>
        Create reusable testing utilities to make your tests more maintainable
        and easier to write.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Testing utilities
export const createTestState = <T>(initialValue: T, name: string) => {
  const stateInstance = state(initialValue, { name });
  const updates: T[] = [initialValue];
  
  const originalSet = stateInstance;
  const wrappedSet = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as Function)(stateInstance()) : value;
    updates.push(newValue);
    return originalSet(value);
  };
  
  return {
    state: stateInstance,
    updates,
    reset: () => {
      updates.length = 1;
      updates[0] = initialValue;
      stateInstance(initialValue);
    },
    getLastUpdate: () => updates[updates.length - 1],
    getUpdateCount: () => updates.length - 1,
  };
};

// Usage
describe('Testing Utilities', () => {
  test('should track state updates', () => {
    const { state, updates, getUpdateCount } = createTestState(0, 'testCount');
    
    expect(getUpdateCount()).toBe(0);
    
    state(5);
    expect(getUpdateCount()).toBe(1);
    expect(updates).toEqual([0, 5]);
    
    state(prev => prev + 1);
    expect(getUpdateCount()).toBe(2);
    expect(updates).toEqual([0, 5, 6]);
  });
});

// Mock utilities
export const createMockState = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<() => void>();
  
  const mockState = (newValue?: T | ((prev: T) => T)) => {
    if (newValue !== undefined) {
      value = typeof newValue === 'function' ? (newValue as Function)(value) : newValue;
      subscribers.forEach(callback => callback());
    }
    return value;
  };
  
  mockState.subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };
  
  return mockState;
};

// Test helpers for React components
export const renderWithState = (
  component: React.ReactElement,
  initialState: Record<string, any> = {}
) => {
  // Setup initial state
  Object.entries(initialState).forEach(([key, value]) => {
    // This would need to be implemented based on your state management
    // For example, if you have a global state registry
  });
  
  return render(component);
};

// Async testing utilities
export const waitForState = async (
  stateGetter: () => any,
  expectedValue: any,
  timeout = 1000
) => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (stateGetter() === expectedValue) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  throw new Error(\`State did not reach expected value within \${timeout}ms\`);
};

// Usage
test('should wait for async state update', async () => {
  const data = state(null, { name: 'data' });
  
  // Simulate async update
  setTimeout(() => {
    data({ id: 1, name: 'Test' });
  }, 100);
  
  await waitForState(() => data(), { id: 1, name: 'Test' });
  
  expect(data()).toEqual({ id: 1, name: 'Test' });
});

// Performance testing utilities
export const measurePerformance = async (fn: () => void | Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Usage
test('should measure performance', async () => {
  const duration = await measurePerformance(async () => {
    // Perform some operation
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  expect(duration).toBeGreaterThan(100);
  expect(duration).toBeLessThan(200);
});`}
      />

      <h2>Best Practices</h2>
      <p>
        Follow these best practices to write effective and maintainable tests.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ✅ DO: Test behavior, not implementation
const goodTest = () => {
  const count = state(0, { name: 'count' });
  const increment = action(() => count(prev => prev + 1), { name: 'increment' });
  
  increment();
  expect(count()).toBe(1); // Test the behavior, not the implementation
};

// ❌ DON'T: Test implementation details
const badTest = () => {
  const count = state(0, { name: 'count' });
  const increment = action(() => count(prev => prev + 1), { name: 'increment' });
  
  // Don't test internal implementation
  expect(increment.toString()).toContain('prev => prev + 1');
};

// ✅ DO: Use descriptive test names
describe('User Authentication', () => {
  test('should login user with valid credentials', () => {
    // Test implementation
  });
  
  test('should reject login with invalid credentials', () => {
    // Test implementation
  });
  
  test('should logout user and clear session', () => {
    // Test implementation
  });
});

// ❌ DON'T: Use vague test names
describe('Auth', () => {
  test('should work', () => {
    // What exactly should work?
  });
});

// ✅ DO: Test edge cases
describe('Edge Cases', () => {
  test('should handle empty arrays', () => {
    const items = state<string[]>([], { name: 'items' });
    const filtered = derived(() => items().filter(item => item.length > 0), {
      name: 'filtered',
    });
    
    expect(filtered()).toEqual([]);
  });
  
  test('should handle null values', () => {
    const data = state(null, { name: 'data' });
    const processed = derived(() => data()?.name || 'default', {
      name: 'processed',
    });
    
    expect(processed()).toBe('default');
  });
});

// ✅ DO: Use setup and teardown
describe('State Management', () => {
  let testState: any;
  
  beforeEach(() => {
    // Setup before each test
    testState = state(0, { name: 'testState' });
  });
  
  afterEach(() => {
    // Cleanup after each test
    testState(0);
  });
  
  test('should increment state', () => {
    testState(prev => prev + 1);
    expect(testState()).toBe(1);
  });
});

// ✅ DO: Test error conditions
describe('Error Handling', () => {
  test('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    const fetchData = action(async () => {
      const data = await mockFetch('/api/data');
      return data;
    }, { name: 'fetchData' });
    
    await expect(fetchData()).rejects.toThrow('Network error');
  });
});

// ✅ DO: Use mocks appropriately
describe('API Integration', () => {
  test('should save data to API', async () => {
    const mockSave = jest.fn().mockResolvedValue({ id: 1 });
    
    const saveData = action(async (data: any) => {
      return await mockSave('/api/save', data);
    }, { name: 'saveData' });
    
    const result = await saveData({ name: 'Test' });
    
    expect(mockSave).toHaveBeenCalledWith('/api/save', { name: 'Test' });
    expect(result).toEqual({ id: 1 });
  });
});

// ✅ DO: Test cleanup
describe('Cleanup', () => {
  test('should cleanup effects on unmount', () => {
    const cleanupSpy = jest.fn();
    
    const testEffect = effect(() => {
      return () => cleanupSpy();
    }, { name: 'testEffect' });
    
    // Simulate unmount
    // In a real test, you'd unmount the component
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
});`}
      />

      <h2>Next Steps</h2>
      <p>Now that you understand testing, explore these related topics:</p>

      <div className={styles.navigation}>
        <Link to="/patterns/state-testing" className={styles.navLink}>
          State Testing Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/action-testing" className={styles.navLink}>
          Action Testing Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API Reference
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/action" className={styles.navLink}>
          action() API Reference
        </Link>
      </div>
    </div>
  );
};

export default Testing;
