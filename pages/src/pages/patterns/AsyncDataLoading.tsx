import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const AsyncDataLoading: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Async Data Loading</h1>
        <p className={styles.subtitle}>
          Handle async operations with loading states, error handling, and
          request cancellation
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Pattern:</span>
          <Link to="/patterns" className={styles.navLink}>
            Patterns
          </Link>
          <span className={styles.navLabel}>/</span>
          <span>Async Data Loading</span>
        </div>
      </nav>

      <h2>Overview</h2>
      <p>
        Async data loading is a common pattern in modern web applications. React
        Understate provides powerful tools for managing async operations with
        proper loading states, error handling, and request cancellation using
        AbortSignal.
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
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Key Features</h3>
        <ul style={{ margin: 0 }}>
          <li>Automatic loading states</li>
          <li>Error boundaries and retry logic</li>
          <li>Request cancellation with AbortSignal</li>
          <li>Race condition prevention</li>
          <li>Optimistic updates</li>
          <li>Cache management</li>
        </ul>
      </div>

      <h2>Basic Async Data Store</h2>
      <p>
        Here's a foundational pattern for managing async data with loading
        states and error handling:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action, effect } from 'react-understate';

// Data types
type User = {
  id: number;
  name: string;
  email: string;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// State
export const users = state<User[]>([], { name: 'users' });
export const loadingState = state<LoadingState>('idle', { name: 'loadingState' });
export const error = state<string | null>(null, { name: 'error' });
export const lastFetch = state<Date | null>(null, { name: 'lastFetch' });

// Derived values
export const isLoading = derived(() => loadingState() === 'loading', {
  name: 'isLoading',
});

export const hasError = derived(() => error() !== null, {
  name: 'hasError',
});

export const isEmpty = derived(() => users().length === 0, {
  name: 'isEmpty',
});

export const shouldRefresh = derived(() => {
  const last = lastFetch();
  if (!last) return true;
  
  // Refresh if data is older than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return last < fiveMinutesAgo;
}, { name: 'shouldRefresh' });

// Actions
export const fetchUsers = action(async (signal?: AbortSignal) => {
  console.log('action: fetching users');
  
  loadingState('loading');
  error(null);
  
  try {
    const response = await fetch('/api/users', { signal });
    
    if (!response.ok) {
      throw new Error(\`Failed to fetch users: \${response.statusText}\`);
    }
    
    const userData: User[] = await response.json();
    
    // Only update if not aborted
    if (!signal?.aborted) {
      users(userData);
      loadingState('success');
      lastFetch(new Date());
    }
  } catch (err) {
    // Don't treat aborted requests as errors
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('action: fetch cancelled');
      return;
    }
    
    console.error('action: fetch error', err);
    error(err instanceof Error ? err.message : 'Unknown error');
    loadingState('error');
  }
}, { name: 'fetchUsers' });

export const refreshUsers = action(async () => {
  console.log('action: refreshing users');
  await fetchUsers();
}, { name: 'refreshUsers' });

export const clearError = action(() => {
  console.log('action: clearing error');
  error(null);
  if (loadingState() === 'error') {
    loadingState('idle');
  }
}, { name: 'clearError' });`}
      />

      <h2>Request Cancellation with AbortController</h2>
      <p>
        To prevent race conditions and unnecessary network requests, we can use
        AbortController to cancel in-flight requests:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Enhanced store with cancellation support
let currentController: AbortController | null = null;

export const fetchUsersWithCancellation = action(async () => {
  console.log('action: fetching users with cancellation');
  
  // Cancel previous request if still pending
  if (currentController) {
    currentController.abort();
  }
  
  // Create new controller for this request
  currentController = new AbortController();
  const signal = currentController.signal;
  
  try {
    await fetchUsers(signal);
  } finally {
    // Clear controller when done
    if (currentController?.signal === signal) {
      currentController = null;
    }
  }
}, { name: 'fetchUsersWithCancellation' });

export const cancelCurrentRequest = action(() => {
  console.log('action: cancelling current request');
  
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}, { name: 'cancelCurrentRequest' });`}
      />

      <h2>Effect-Based Auto-Fetching</h2>
      <p>
        Use effects to automatically fetch data when certain conditions are met:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { effect } from 'react-understate';

// Auto-fetch when component mounts or when refresh is needed
export const autoFetchEffect = effect(() => {
  console.log('effect: checking if auto-fetch needed');
  
  const needsRefresh = shouldRefresh();
  const currentlyLoading = isLoading();
  
  if (needsRefresh && !currentlyLoading) {
    console.log('effect: triggering auto-fetch');
    fetchUsersWithCancellation();
  }
}, { name: 'autoFetchEffect' });

// Auto-retry failed requests after a delay
let retryTimeoutId: number | null = null;

export const autoRetryEffect = effect(() => {
  const hasErr = hasError();
  const loading = isLoading();
  
  // Clear existing timeout
  if (retryTimeoutId) {
    clearTimeout(retryTimeoutId);
    retryTimeoutId = null;
  }
  
  // Set up retry if there's an error and not currently loading
  if (hasErr && !loading) {
    console.log('effect: scheduling retry in 5 seconds');
    retryTimeoutId = window.setTimeout(() => {
      console.log('effect: retrying failed request');
      fetchUsersWithCancellation();
    }, 5000);
  }
  
  // Cleanup function
  return () => {
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }
  };
}, { name: 'autoRetryEffect' });`}
      />

      <h2>Advanced Pattern: Resource Manager</h2>
      <p>
        For complex applications, create a reusable resource manager that
        handles caching, cancellation, and lifecycle management:
      </p>

      <CodeBlock
        language="typescript"
        code={`type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
};

type ResourceConfig = {
  cacheDuration?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number;
};

export function createResourceManager<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  config: ResourceConfig = {}
) {
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;
  
  // State
  const resourceState = state<ResourceState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });
  
  let currentController: AbortController | null = null;
  let retryCount = 0;
  
  // Derived values
  const data = derived(() => resourceState().data);
  const loading = derived(() => resourceState().loading);
  const error = derived(() => resourceState().error);
  
  const isStale = derived(() => {
    const state = resourceState();
    if (!state.lastFetch) return true;
    
    const now = Date.now();
    const fetchTime = state.lastFetch.getTime();
    return now - fetchTime > cacheDuration;
  });
  
  // Actions
  const fetch = action(async (force = false) => {
    const state = resourceState();
    
    // Skip if already loading or data is fresh
    if (state.loading || (!force && !isStale() && state.data)) {
      return state.data;
    }
    
    // Cancel previous request
    if (currentController) {
      currentController.abort();
    }
    
    currentController = new AbortController();
    const signal = currentController.signal;
    
    // Update loading state
    resourceState({
      ...state,
      loading: true,
      error: null,
    });
    
    try {
      const result = await fetcher(signal);
      
      if (!signal.aborted) {
        retryCount = 0; // Reset retry count on success
        resourceState({
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date(),
        });
        return result;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Don't handle aborted requests
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Retry logic
      if (retryCount < retryAttempts) {
        retryCount++;
        console.log(\`Retrying request (attempt \${retryCount}/\${retryAttempts})\`);
        
        setTimeout(() => {
          if (!signal.aborted) {
            fetch(force);
          }
        }, retryDelay * retryCount); // Exponential backoff
        
        return;
      }
      
      // Max retries reached
      resourceState({
        ...resourceState(),
        loading: false,
        error: errorMessage,
      });
    } finally {
      if (currentController?.signal === signal) {
        currentController = null;
      }
    }
  });
  
  const refresh = action(() => fetch(true));
  
  const cancel = action(() => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
    
    resourceState({
      ...resourceState(),
      loading: false,
    });
  });
  
  const clearError = action(() => {
    resourceState({
      ...resourceState(),
      error: null,
    });
  });
  
  return {
    // State
    data,
    loading,
    error,
    isStale,
    
    // Actions
    fetch,
    refresh,
    cancel,
    clearError,
  };
}

// Usage example
export const userResource = createResourceManager<User[]>(
  async (signal) => {
    const response = await fetch('/api/users', { signal });
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    return response.json();
  },
  {
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    retryAttempts: 3,
    retryDelay: 1000,
  }
);`}
      />

      <h2>Using in React Components</h2>
      <p>Here's how to use the async data patterns in React components:</p>

      <CodeBlock
        language="tsx"
        code={`import React, { useEffect } from 'react';
import { useUnderstate } from 'react-understate';
import {
  users,
  isLoading,
  hasError,
  error,
  isEmpty,
  fetchUsersWithCancellation,
  cancelCurrentRequest,
  clearError,
  userResource,
} from './userStore';

// Basic usage
function UserList() {
  const userList = useUnderstate(users);
  const loading = useUnderstate(isLoading);
  const hasErr = useUnderstate(hasError);
  const errorMsg = useUnderstate(error);
  const empty = useUnderstate(isEmpty);

  useEffect(() => {
    // Fetch on mount
    fetchUsersWithCancellation();
    
    // Cancel on unmount
    return () => {
      cancelCurrentRequest();
    };
  }, []);

  if (loading) {
    return (
      <div>
        Loading users...
        <button onClick={cancelCurrentRequest}>Cancel</button>
      </div>
    );
  }

  if (hasErr) {
    return (
      <div>
        <p>Error: {errorMsg}</p>
        <button onClick={clearError}>Dismiss</button>
        <button onClick={fetchUsersWithCancellation}>Retry</button>
      </div>
    );
  }

  if (empty) {
    return <p>No users found.</p>;
  }

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => fetchUsersWithCancellation()}>
        Refresh
      </button>
      <ul>
        {userList.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

// Using resource manager
function UserListWithResource() {
  const data = useUnderstate(userResource.data);
  const loading = useUnderstate(userResource.loading);
  const error = useUnderstate(userResource.error);
  const isStale = useUnderstate(userResource.isStale);

  useEffect(() => {
    userResource.fetch();
    
    return () => {
      userResource.cancel();
    };
  }, []);

  return (
    <div>
      {isStale && <p>Data may be outdated</p>}
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div>
          <p>Error: {error}</p>
          <button onClick={userResource.clearError}>Dismiss</button>
          <button onClick={userResource.refresh}>Retry</button>
        </div>
      )}
      
      {data && (
        <div>
          <button onClick={userResource.refresh}>
            Refresh {loading ? '(Loading...)' : ''}
          </button>
          <ul>
            {data.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { UserList, UserListWithResource };`}
      />

      <h2>Optimistic Updates</h2>
      <p>
        For better user experience, you can implement optimistic updates that
        immediately update the UI and roll back on failure:
      </p>

      <CodeBlock
        language="typescript"
        code={`export const addUserOptimistic = action(async (newUser: Omit<User, 'id'>) => {
  console.log('action: adding user optimistically');
  
  // Generate optimistic ID
  const optimisticId = Date.now();
  const optimisticUser: User = { ...newUser, id: optimisticId };
  
  // Immediately add to UI
  const currentUsers = users();
  users([...currentUsers, optimisticUser]);
  
  const controller = new AbortController();
  
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to add user: \${response.statusText}\`);
    }
    
    const savedUser: User = await response.json();
    
    // Replace optimistic user with real user
    users(prev => prev.map(user => 
      user.id === optimisticId ? savedUser : user
    ));
    
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    
    // Roll back optimistic update
    users(prev => prev.filter(user => user.id !== optimisticId));
    
    // Show error
    error(err instanceof Error ? err.message : 'Failed to add user');
    throw err;
  }
}, { name: 'addUserOptimistic' });

export const deleteUserOptimistic = action(async (userId: number) => {
  console.log('action: deleting user optimistically');
  
  // Store original state for rollback
  const originalUsers = users();
  
  // Immediately remove from UI
  users(prev => prev.filter(user => user.id !== userId));
  
  try {
    const response = await fetch(\`/api/users/\${userId}\`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(\`Failed to delete user: \${response.statusText}\`);
    }
    
    // Success - no need to update UI, already removed
    
  } catch (err) {
    // Roll back - restore original state
    users(originalUsers);
    
    error(err instanceof Error ? err.message : 'Failed to delete user');
    throw err;
  }
}, { name: 'deleteUserOptimistic' });`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Always handle cancellation:</strong> Use AbortSignal to
          prevent race conditions
        </li>
        <li>
          <strong>Implement proper error boundaries:</strong> Don't let async
          errors crash your app
        </li>
        <li>
          <strong>Use loading states:</strong> Give users feedback during async
          operations
        </li>
        <li>
          <strong>Cache wisely:</strong> Don't fetch the same data repeatedly
        </li>
        <li>
          <strong>Retry with backoff:</strong> Implement exponential backoff for
          retries
        </li>
        <li>
          <strong>Clean up on unmount:</strong> Cancel requests when components
          unmount
        </li>
        <li>
          <strong>Use optimistic updates:</strong> Update UI immediately for
          better UX
        </li>
        <li>
          <strong>Log actions:</strong> Use consistent logging for debugging
          [[memory:8328508]]
        </li>
      </ul>

      <h2>Related Patterns</h2>
      <div className={styles.navigation}>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/form-validation" className={styles.navLink}>
          Form Validation
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/effect" className={styles.navLink}>
          effect() API
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/action" className={styles.navLink}>
          action() API
        </Link>
      </div>
    </div>
  );
};

export default AsyncDataLoading;
