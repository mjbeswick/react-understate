import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const StateManagement: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>State Management Guide</h1>
        <p className={styles.subtitle}>
          Complete guide to managing state in React Understate applications
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/state-management" className={styles.navLink}>
            State Management
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        State management is the foundation of any React application. React
        Understate provides a simple yet powerful approach to state management
        that scales from simple components to complex applications. This guide
        covers everything you need to know about managing state effectively.
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
          <li>Creating and organizing state atoms</li>
          <li>State composition patterns</li>
          <li>Managing complex state structures</li>
          <li>Performance optimization techniques</li>
          <li>Debugging and development tools</li>
          <li>Common patterns and anti-patterns</li>
        </ul>
      </div>

      <h2>Creating State</h2>
      <p>
        The `state()` function is the building block of React Understate. It
        creates reactive state atoms that can be subscribed to and updated
        independently.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state } from 'react-understate';

// Simple primitive state
export const count = state(0, { name: 'count' });
export const message = state('Hello World', { name: 'message' });
export const isVisible = state(true, { name: 'isVisible' });

// Object state
export const user = state({
  id: null as number | null,
  name: '',
  email: '',
  isLoggedIn: false,
}, { name: 'user' });

// Array state
export const items = state<string[]>([], { name: 'items' });

// Complex nested state
export const appState = state({
  ui: {
    theme: 'light' as 'light' | 'dark',
    sidebar: {
      open: false,
      width: 250,
    },
  },
  data: {
    users: [] as User[],
    loading: false,
    error: null as string | null,
  },
}, { name: 'appState' });`}
      />

      <h2>Reading State</h2>
      <p>
        React Understate provides multiple ways to read state values depending
        on your use case and performance requirements.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Direct access (outside React components)
const currentCount = count();
const currentUser = user();

// In React components - single state
function Counter() {
  const countValue = useUnderstate(count);
  return <div>Count: {countValue}</div>;
}

// In React components - multiple states
function UserProfile() {
  const { user: userData, count: countValue } = useUnderstate({
    user,
    count,
  });
  
  return (
    <div>
      <h1>{userData.name}</h1>
      <p>Count: {countValue}</p>
    </div>
  );
}

// Selective subscription (performance optimization)
function UserName() {
  // Only re-renders when user.name changes
  const userName = useUnderstate(derived(() => user().name));
  return <h1>{userName}</h1>;
}

// Conditional subscription
function ConditionalDisplay() {
  const { isVisible: visible, message: msg } = useUnderstate({
    isVisible,
    message: isVisible() ? message : state(''), // Only subscribe when visible
  });
  
  return visible ? <p>{msg}</p> : null;
}`}
      />

      <h2>Updating State</h2>
      <p>
        State updates in React Understate are straightforward and can be done
        synchronously or asynchronously, with automatic batching for
        performance.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Direct updates
count(42);
message('New message');
isVisible(false);

// Functional updates
count(prev => prev + 1);
items(prev => [...prev, 'new item']);

// Object updates (shallow merge)
user(prev => ({
  ...prev,
  name: 'John Doe',
  isLoggedIn: true,
}));

// Deep object updates
appState(prev => ({
  ...prev,
  ui: {
    ...prev.ui,
    sidebar: {
      ...prev.ui.sidebar,
      open: !prev.ui.sidebar.open,
    },
  },
}));

// Multiple updates (automatically batched)
function updateProfile(name: string, email: string) {
  user(prev => ({ ...prev, name }));
  user(prev => ({ ...prev, email }));
  // Both updates are batched into a single re-render
}

// Async updates
async function loadUser(id: number) {
  user(prev => ({ ...prev, loading: true }));
  
  try {
    const userData = await fetchUser(id);
    user(prev => ({
      ...prev,
      ...userData,
      loading: false,
      isLoggedIn: true,
    }));
  } catch (error) {
    user(prev => ({
      ...prev,
      loading: false,
      error: error.message,
    }));
  }
}`}
      />

      <h2>State Composition Patterns</h2>
      <p>
        Breaking down complex state into smaller, focused atoms makes your
        application more maintainable and performant.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Avoid: Monolithic state
const badAppState = state({
  user: { id: 1, name: 'John' },
  todos: [{ id: 1, text: 'Learn React' }],
  ui: { theme: 'dark', sidebar: true },
  settings: { notifications: true },
  // ... everything in one giant object
});

// ✅ Good: Atomic state composition
export const user = state({
  id: null as number | null,
  name: '',
  email: '',
}, { name: 'user' });

export const todos = state<Todo[]>([], { name: 'todos' });

export const uiSettings = state({
  theme: 'light' as 'light' | 'dark',
  sidebarOpen: false,
}, { name: 'uiSettings' });

export const userSettings = state({
  notifications: true,
  autoSave: false,
  language: 'en',
}, { name: 'userSettings' });

// Compose when needed
export const appData = derived(() => ({
  user: user(),
  todos: todos(),
  ui: uiSettings(),
  settings: userSettings(),
}), { name: 'appData' });`}
      />

      <h2>Managing Complex State</h2>
      <p>
        For complex state structures, use patterns that maintain immutability
        and provide clear update semantics.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Entity management pattern
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

export const todos = state<Todo[]>([], { name: 'todos' });
export const selectedTodoId = state<string | null>(null, { name: 'selectedTodoId' });

// Helper actions for complex operations
export const addTodo = action((text: string) => {
  console.log('action: adding todo', text);
  
  const newTodo: Todo = {
    id: \`todo-\${Date.now()}\`,
    text,
    completed: false,
    createdAt: new Date(),
  };
  
  todos(prev => [...prev, newTodo]);
}, { name: 'addTodo' });

export const updateTodo = action((id: string, updates: Partial<Todo>) => {
  console.log('action: updating todo', id, updates);
  
  todos(prev => prev.map(todo =>
    todo.id === id ? { ...todo, ...updates } : todo
  ));
}, { name: 'updateTodo' });

export const deleteTodo = action((id: string) => {
  console.log('action: deleting todo', id);
  
  todos(prev => prev.filter(todo => todo.id !== id));
  
  // Clear selection if deleted todo was selected
  if (selectedTodoId() === id) {
    selectedTodoId(null);
  }
}, { name: 'deleteTodo' });

export const toggleTodo = action((id: string) => {
  console.log('action: toggling todo', id);
  
  updateTodo(id, { 
    completed: !todos().find(t => t.id === id)?.completed 
  });
}, { name: 'toggleTodo' });

// Batch operations for performance
export const markAllCompleted = action(() => {
  console.log('action: marking all todos completed');
  
  batch(() => {
    todos(prev => prev.map(todo => ({ ...todo, completed: true })));
  });
}, { name: 'markAllCompleted' });

export const clearCompleted = action(() => {
  console.log('action: clearing completed todos');
  
  const completedIds = todos().filter(t => t.completed).map(t => t.id);
  
  batch(() => {
    todos(prev => prev.filter(todo => !todo.completed));
    
    // Clear selection if selected todo was completed
    if (selectedTodoId() && completedIds.includes(selectedTodoId()!)) {
      selectedTodoId(null);
    }
  });
}, { name: 'clearCompleted' });`}
      />

      <h2>State Normalization</h2>
      <p>
        For complex relational data, normalize your state structure to avoid
        duplication and make updates more efficient.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Avoid: Nested relational data
const badState = state({
  posts: [
    {
      id: 1,
      title: 'Post 1',
      author: { id: 1, name: 'John', email: 'john@example.com' },
      comments: [
        { id: 1, text: 'Great post!', author: { id: 2, name: 'Jane' } },
        { id: 2, text: 'Thanks!', author: { id: 1, name: 'John' } },
      ],
    },
    // ... more posts with duplicated author data
  ],
});

// ✅ Good: Normalized state structure
export const users = state<Record<string, User>>({}, { name: 'users' });
export const posts = state<Record<string, Post>>({}, { name: 'posts' });
export const comments = state<Record<string, Comment>>({}, { name: 'comments' });

type User = {
  id: string;
  name: string;
  email: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  commentIds: string[];
};

type Comment = {
  id: string;
  text: string;
  postId: string;
  authorId: string;
};

// Actions for normalized updates
export const addUser = action((user: User) => {
  console.log('action: adding user', user.id);
  users(prev => ({ ...prev, [user.id]: user }));
}, { name: 'addUser' });

export const addPost = action((post: Omit<Post, 'commentIds'>) => {
  console.log('action: adding post', post.id);
  posts(prev => ({
    ...prev,
    [post.id]: { ...post, commentIds: [] },
  }));
}, { name: 'addPost' });

export const addComment = action((comment: Comment) => {
  console.log('action: adding comment', comment.id);
  
  batch(() => {
    // Add comment
    comments(prev => ({ ...prev, [comment.id]: comment }));
    
    // Update post's comment list
    posts(prev => ({
      ...prev,
      [comment.postId]: {
        ...prev[comment.postId],
        commentIds: [...prev[comment.postId].commentIds, comment.id],
      },
    }));
  });
}, { name: 'addComment' });

// Selectors for denormalized views
export const getPostWithAuthor = (postId: string) => derived(() => {
  const post = posts()[postId];
  const author = post ? users()[post.authorId] : null;
  
  return post && author ? { ...post, author } : null;
}, { name: \`postWithAuthor-\${postId}\` });

export const getPostWithComments = (postId: string) => derived(() => {
  const post = posts()[postId];
  if (!post) return null;
  
  const postComments = post.commentIds.map(id => {
    const comment = comments()[id];
    const author = comment ? users()[comment.authorId] : null;
    return comment && author ? { ...comment, author } : null;
  }).filter(Boolean);
  
  return {
    ...post,
    author: users()[post.authorId],
    comments: postComments,
  };
}, { name: \`postWithComments-\${postId}\` });`}
      />

      <h2>Performance Optimization</h2>
      <p>
        React Understate provides several patterns to optimize performance in
        large applications.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Granular subscriptions
// ❌ Avoid: Subscribing to entire large objects
function UserProfile() {
  const userData = useUnderstate(user); // Re-renders on any user property change
  return <h1>{userData.name}</h1>; // Only needs name
}

// ✅ Good: Subscribe to specific properties
const userName = derived(() => user().name, { name: 'userName' });

function UserProfile() {
  const name = useUnderstate(userName); // Only re-renders when name changes
  return <h1>{name}</h1>;
}

// 2. Memoized selectors for expensive computations
export const expensiveComputation = derived(() => {
  const data = largeDataSet();
  
  // Expensive calculation only runs when data changes
  return data
    .filter(item => item.active)
    .sort((a, b) => b.priority - a.priority)
    .map(item => ({
      ...item,
      displayName: \`\${item.name} (\${item.category})\`,
    }));
}, { name: 'expensiveComputation' });

// 3. Conditional subscriptions
function ConditionalList() {
  const showList = useUnderstate(shouldShowList);
  
  // Only subscribe to items when list is visible
  const items = useUnderstate(showList ? expensiveItems : state([]));
  
  return showList ? (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  ) : null;
}

// 4. Batching updates for better performance
export const batchedUpdate = action(() => {
  console.log('action: performing batched update');
  
  batch(() => {
    // All these updates are batched into a single re-render
    user(prev => ({ ...prev, name: 'New Name' }));
    user(prev => ({ ...prev, email: 'new@email.com' }));
    todos(prev => [...prev, newTodo]);
    uiSettings(prev => ({ ...prev, theme: 'dark' }));
  });
}, { name: 'batchedUpdate' });

// 5. Lazy initialization for expensive default values
export const expensiveState = state(() => {
  // This function only runs once, when state is first accessed
  console.log('Initializing expensive state...');
  return performExpensiveCalculation();
}, { name: 'expensiveState' });

// 6. State splitting for large lists
// Instead of one large array, split into chunks
export const createPaginatedState = <T>(pageSize = 50) => {
  const allItems = state<T[]>([], { name: 'allItems' });
  const currentPage = state(0, { name: 'currentPage' });
  
  const totalPages = derived(() => 
    Math.ceil(allItems().length / pageSize)
  , { name: 'totalPages' });
  
  const currentPageItems = derived(() => {
    const items = allItems();
    const page = currentPage();
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, { name: 'currentPageItems' });
  
  return {
    allItems,
    currentPage,
    totalPages,
    currentPageItems,
    pageSize,
  };
};`}
      />

      <h2>Debugging State</h2>
      <p>
        React Understate provides excellent debugging capabilities to help you
        understand state changes and track down issues.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { configureDebug } from 'react-understate';

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  configureDebug({
    enabled: true,
    logStateChanges: true,
    logActionCalls: true,
    logDerivedUpdates: true,
    filter: (name) => {
      // Only log specific states/actions
      return name.includes('user') || name.includes('todo');
    },
  });
}

// Custom debug logging for specific states
export const debuggedUser = state({ name: '', email: '' }, {
  name: 'debuggedUser',
  debug: {
    logChanges: true,
    beforeChange: (oldValue, newValue) => {
      console.log('User changing from:', oldValue, 'to:', newValue);
    },
    afterChange: (newValue) => {
      console.log('User changed to:', newValue);
    },
  },
});

// Debug utilities
export const stateSnapshot = () => {
  return {
    user: user(),
    todos: todos(),
    ui: uiSettings(),
    timestamp: new Date().toISOString(),
  };
};

export const logStateSnapshot = action(() => {
  console.log('action: logging state snapshot');
  console.table(stateSnapshot());
}, { name: 'logStateSnapshot' });

// Performance monitoring
export const performanceMonitor = effect(() => {
  const startTime = performance.now();
  
  // Track expensive derived value
  const result = expensiveComputation();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // Longer than one frame
    console.warn(\`Expensive computation took \${duration.toFixed(2)}ms\`);
  }
  
  return result;
}, { name: 'performanceMonitor' });`}
      />

      <h2>Common Patterns</h2>
      <p>
        Here are some common patterns that work well with React Understate's
        state management approach.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Loading states pattern
export const createAsyncState = <T>(initialData: T) => {
  const data = state(initialData, { name: 'data' });
  const loading = state(false, { name: 'loading' });
  const error = state<string | null>(null, { name: 'error' });
  
  const isIdle = derived(() => !loading() && !error(), { name: 'isIdle' });
  const hasError = derived(() => error() !== null, { name: 'hasError' });
  
  return { data, loading, error, isIdle, hasError };
};

// 2. Form state pattern
export const createFormState = <T extends Record<string, any>>(initialValues: T) => {
  const values = state(initialValues, { name: 'formValues' });
  const errors = state<Partial<Record<keyof T, string>>>({}, { name: 'formErrors' });
  const touched = state<Partial<Record<keyof T, boolean>>>({}, { name: 'formTouched' });
  const isSubmitting = state(false, { name: 'isSubmitting' });
  
  const isValid = derived(() => Object.keys(errors()).length === 0, { name: 'isValid' });
  const isDirty = derived(() => {
    const current = values();
    return Object.keys(current).some(key => current[key] !== initialValues[key]);
  }, { name: 'isDirty' });
  
  const setValue = action((field: keyof T, value: any) => {
    values(prev => ({ ...prev, [field]: value }));
    touched(prev => ({ ...prev, [field]: true }));
  }, { name: 'setValue' });
  
  const setError = action((field: keyof T, error: string) => {
    errors(prev => ({ ...prev, [field]: error }));
  }, { name: 'setError' });
  
  const clearError = action((field: keyof T) => {
    errors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, { name: 'clearError' });
  
  const reset = action(() => {
    values(initialValues);
    errors({});
    touched({});
    isSubmitting(false);
  }, { name: 'reset' });
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    reset,
  };
};

// 3. Modal/Dialog state pattern
export const createModalState = () => {
  const isOpen = state(false, { name: 'modalOpen' });
  const data = state<any>(null, { name: 'modalData' });
  
  const open = action((modalData?: any) => {
    console.log('action: opening modal');
    isOpen(true);
    if (modalData !== undefined) {
      data(modalData);
    }
  }, { name: 'openModal' });
  
  const close = action(() => {
    console.log('action: closing modal');
    isOpen(false);
    data(null);
  }, { name: 'closeModal' });
  
  const toggle = action(() => {
    console.log('action: toggling modal');
    isOpen(prev => !prev);
  }, { name: 'toggleModal' });
  
  return { isOpen, data, open, close, toggle };
};

// Usage examples
export const userAsyncState = createAsyncState({ id: null, name: '', email: '' });
export const loginForm = createFormState({ email: '', password: '' });
export const confirmModal = createModalState();`}
      />

      <h2>Anti-Patterns to Avoid</h2>
      <p>
        Here are common mistakes to avoid when managing state with React
        Understate.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Don't mutate state directly
const badUpdate = () => {
  const currentTodos = todos();
  currentTodos.push(newTodo); // Mutates the array!
  todos(currentTodos); // This won't trigger updates correctly
};

// ✅ Always create new objects/arrays
const goodUpdate = () => {
  todos(prev => [...prev, newTodo]);
};

// ❌ Don't create state inside components
function BadComponent() {
  const [localState] = useState(() => state(0)); // Creates new state on every render!
  return <div>{useUnderstate(localState)}</div>;
}

// ✅ Create state outside components or use useState for local state
const componentState = state(0, { name: 'componentState' });

function GoodComponent() {
  const value = useUnderstate(componentState);
  return <div>{value}</div>;
}

// ❌ Don't use state for derived values
const totalItems = state(0, { name: 'totalItems' });

const updateTotal = () => {
  totalItems(todos().length); // Manual sync required!
};

// ✅ Use derived for computed values
const totalItems = derived(() => todos().length, { name: 'totalItems' });

// ❌ Don't ignore batching for multiple updates
const slowUpdate = () => {
  user(prev => ({ ...prev, name: 'John' }));    // Triggers re-render
  user(prev => ({ ...prev, email: 'john@...' })); // Triggers re-render
  user(prev => ({ ...prev, age: 30 }));           // Triggers re-render
};

// ✅ Use batch() for multiple related updates
const fastUpdate = () => {
  batch(() => {
    user(prev => ({ ...prev, name: 'John' }));
    user(prev => ({ ...prev, email: 'john@...' }));
    user(prev => ({ ...prev, age: 30 }));
    // Only one re-render for all updates
  });
};

// ❌ Don't create circular dependencies
const a = derived(() => b() + 1, { name: 'a' });
const b = derived(() => a() + 1, { name: 'b' }); // Circular!

// ✅ Design dependencies as a directed acyclic graph
const base = state(0, { name: 'base' });
const derived1 = derived(() => base() + 1, { name: 'derived1' });
const derived2 = derived(() => derived1() * 2, { name: 'derived2' });`}
      />

      <h2>Next Steps</h2>
      <p>
        Now that you understand the fundamentals of state management, explore
        these related topics:
      </p>

      <div className={styles.navigation}>
        <Link to="/guides/derived-values" className={styles.navLink}>
          Derived Values Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/effects" className={styles.navLink}>
          Effects Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API Reference
        </Link>
      </div>
    </div>
  );
};

export default StateManagement;
