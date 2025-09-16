import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';

const EffectAPIContent: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>effect()</h1>
        <p className={styles.subtitle}>
          Run side effects reactively when state changes
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signature</h2>
        <div className={styles.apiSignature}>
          effect(fn: EffectFn, debugName?: string, options?: EffectOptions): ()
          =&gt; void
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>fn</span>
            <span className={styles.parameterType}>EffectFn</span>
            <div className={styles.parameterDescription}>
              The effect function that runs when dependencies change. Can return
              a cleanup function or a Promise for async effects. Receives an
              AbortSignal for cancellation.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>debugName</span>
            <span className={styles.parameterType}>string (optional)</span>
            <div className={styles.parameterDescription}>
              A name for debugging purposes. Shows up in dev tools and debug
              logs when debugging is enabled.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>options</span>
            <span className={styles.parameterType}>
              EffectOptions (optional)
            </span>
            <div className={styles.parameterDescription}>
              Configuration options: once (run only once), preventOverlap
              (prevent concurrent async effects), preventLoops (prevent infinite
              loops).
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>effect()</code> function creates reactive side effects that
        automatically run when their dependencies change. Effects are perfect
        for logging, API calls, DOM manipulations, persistence, and any other
        side effects your application needs.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔄 Automatic Dependencies</div>
          <div className={styles.featureDescription}>
            No dependency arrays. Effects automatically track which states they
            depend on.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>⚡ Immediate Execution</div>
          <div className={styles.featureDescription}>
            Effects run immediately when created and whenever dependencies
            change.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧹 Automatic Cleanup</div>
          <div className={styles.featureDescription}>
            Return cleanup functions for automatic resource management and leak
            prevention.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🚀 Async Support</div>
          <div className={styles.featureDescription}>
            Full support for async effects with automatic cancellation and
            overlap prevention.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Basic Usage</h2>

        <h3>Simple Effect</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, effect } from 'react-understate';

const count = state(0, 'count');

// Effect runs immediately and when count changes
const dispose = effect(() => {
  console.log(\`Count is now: \${count.value}\`);
}, 'logCount');

count.value = 5; // Logs: "Count is now: 5"
count.value = 10; // Logs: "Count is now: 10"

// Stop the effect when no longer needed
dispose();`}
        />

        <h3>Multiple Dependencies</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, effect } from 'react-understate';

const firstName = state('John', 'firstName');
const lastName = state('Doe', 'lastName');
const title = state('Mr.', 'title');

// Effect automatically tracks all accessed states
effect(() => {
  const fullName = \`\${title.value} \${firstName.value} \${lastName.value}\`;
  console.log(\`Full name: \${fullName}\`);
}, 'updateFullName');

firstName.value = 'Jane'; // Logs: "Full name: Mr. Jane Doe"
title.value = 'Ms.';       // Logs: "Full name: Ms. Jane Doe"
lastName.value = 'Smith';  // Logs: "Full name: Ms. Jane Smith"`}
        />

        <h3>Cleanup Functions</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, effect } from 'react-understate';

const isPolling = state(false, 'isPolling');
const data = state(null, 'pollingData');

effect(() => {
  if (isPolling.value) {
    console.log('Starting to poll...');
    
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/data');
        data.value = await response.json();
        console.log('Data updated:', data.value);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 1000);
    
    // Return cleanup function
    return () => {
      console.log('Stopping polling');
      clearInterval(intervalId);
    };
  }
}, 'pollingEffect');

isPolling.value = true;  // Starts polling
isPolling.value = false; // Stops polling (cleanup runs)`}
        />
      </div>

      <h2>Effect Options</h2>

      <h3>once: true - One-Time Effects</h3>
      <p>
        Perfect for initialization, setup, or cleanup that should only happen
        once:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const user = state(null, 'user');

// Initialize user session only once
effect(() => {
  console.log('Initializing user session...');
  // This will only run once, even if user changes
  initializeUserSession();
  loadUserPreferences();
}, 'initializeUser', { once: true });

// Setup global event listeners
effect(() => {
  const handleResize = () => {
    console.log('Window resized:', window.innerWidth, window.innerHeight);
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'k') {
      console.log('Search shortcut pressed');
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyPress);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyPress);
  };
}, 'setupGlobalListeners', { once: true });`}
      />

      <h3>preventOverlap: true - Prevent Concurrent Executions</h3>
      <p>Essential for async effects that shouldn't run concurrently:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const searchQuery = state('', 'searchQuery');
const searchResults = state([], 'searchResults');
const isLoading = state(false, 'isLoading');

// Search effect that prevents overlapping API calls
effect(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  
  try {
    const response = await fetch(\`/api/search?q=\${encodeURIComponent(searchQuery.value)}\`);
    const results = await response.json();
    
    searchResults.value = results;
    console.log(\`Found \${results.length} results for "\${searchQuery.value}"\`);
  } catch (error) {
    console.error('Search failed:', error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}, 'searchEffect', { preventOverlap: true });

// Multiple rapid changes won't cause overlapping API calls
searchQuery.value = 'react';
searchQuery.value = 'vue';      // Previous search is cancelled
searchQuery.value = 'angular';  // Previous search is cancelled
// Only the last search ('angular') will complete`}
      />

      <h3>preventLoops: false - Allow All Re-executions</h3>
      <p>
        Use with caution - allows effects to re-run on any dependency change:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const inputData = state({ items: [] }, 'inputData');
const processedData = state([], 'processedData');
const processingLog = state([], 'processingLog');

// Data processing pipeline that re-runs on any change
effect(() => {
  const items = inputData.value.items;
  const currentLog = processingLog.value;
  
  // Process the data
  const processed = items.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now()
  }));
  
  // Update processed data
  processedData.value = processed;
  
  // Log the processing (this would normally cause a loop)
  processingLog.value = [
    ...currentLog,
    \`Processed \${processed.length} items at \${new Date().toISOString()}\`
  ];
  
  console.log(\`Processing complete: \${processed.length} items\`);
}, 'dataProcessingPipeline', { preventLoops: false });

// This will trigger multiple processing cycles
inputData.value = { items: [{ id: 1, name: 'Item 1' }] };`}
      />

      <h2>Async Effects and Cancellation</h2>
      <p>
        Async effects receive an AbortSignal for proper request cancellation:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const userId = state(1, 'userId');
const userData = state(null, 'userData');
const userPosts = state([], 'userPosts');
const isLoading = state(false, 'isLoading');

// Effect with AbortSignal support
effect(async ({ signal }) => {
  if (!userId.value) {
    userData.value = null;
    userPosts.value = [];
    return;
  }

  isLoading.value = true;
  
  try {
    // Fetch user data with cancellation support
    const userResponse = await fetch(\`/api/users/\${userId.value}\`, { signal });
    const user = await userResponse.json();
    userData.value = user;
    
    // Fetch user posts with cancellation support
    const postsResponse = await fetch(\`/api/users/\${userId.value}/posts\`, { signal });
    const posts = await postsResponse.json();
    userPosts.value = posts;
    
    console.log(\`Loaded data for user \${user.name}\`);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      console.error('Failed to load user data:', error);
      userData.value = null;
      userPosts.value = [];
    }
  } finally {
    isLoading.value = false;
  }
}, 'loadUserData', { preventOverlap: true });

// Rapid changes will cancel previous requests
userId.value = 2; // Cancels previous request
userId.value = 3; // Cancels previous request
userId.value = 4; // Only this request will complete`}
      />

      <h2>Real-World Examples</h2>

      <h3>Local Storage Persistence</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const userPreferences = state({
  theme: 'light',
  language: 'en',
  notifications: true,
  autoSave: true
}, 'userPreferences');

// Automatically save preferences to localStorage
effect(() => {
  const prefs = userPreferences.value;
  
  try {
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
    console.log('Preferences saved to localStorage');
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}, 'savePreferences');

// Load preferences on initialization
effect(() => {
  try {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      const parsed = JSON.parse(saved);
      userPreferences.value = { ...userPreferences.value, ...parsed };
      console.log('Preferences loaded from localStorage');
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
}, 'loadPreferences', { once: true });

// Usage
userPreferences.value = { 
  ...userPreferences.value, 
  theme: 'dark' 
}; // Automatically saves to localStorage`}
      />

      <h3>Document Title Management</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, effect, derived } from 'react-understate';

const currentPage = state('Home', 'currentPage');
const unreadNotifications = state(0, 'unreadNotifications');
const userName = state('', 'userName');

// Derived title that combines multiple states
const documentTitle = derived(() => {
  const page = currentPage.value;
  const unread = unreadNotifications.value;
  const user = userName.value;
  
  let title = page;
  
  if (unread > 0) {
    title = \`(\${unread}) \${title}\`;
  }
  
  if (user) {
    title += \` - \${user}\`;
  }
  
  return title;
}, 'documentTitle');

// Effect to update document title
effect(() => {
  document.title = documentTitle.value;
  console.log(\`Document title updated: \${documentTitle.value}\`);
}, 'updateDocumentTitle');

// Usage
currentPage.value = 'Dashboard'; // Title: "Dashboard"
unreadNotifications.value = 3;   // Title: "(3) Dashboard"
userName.value = 'John Doe';     // Title: "(3) Dashboard - John Doe"`}
      />

      <h3>Form Validation</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, effect, derived } from 'react-understate';

const formData = state({
  email: '',
  password: '',
  confirmPassword: ''
}, 'formData');

const validationErrors = state({}, 'validationErrors');

// Email validation effect
effect(() => {
  const { email } = formData.value;
  const errors = { ...validationErrors.value };
  
  if (email && !email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  } else {
    delete errors.email;
  }
  
  validationErrors.value = errors;
}, 'validateEmail');

// Password validation effect
effect(() => {
  const { password, confirmPassword } = formData.value;
  const errors = { ...validationErrors.value };
  
  if (password && password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else {
    delete errors.password;
  }
  
  if (confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    delete errors.confirmPassword;
  }
  
  validationErrors.value = errors;
}, 'validatePassword');

// Derived form validity
const isFormValid = derived(() => {
  const { email, password, confirmPassword } = formData.value;
  const errors = validationErrors.value;
  
  return email && password && confirmPassword && 
         Object.keys(errors).length === 0;
}, 'isFormValid');

// Usage
formData.value = { ...formData.value, email: 'invalid-email' };
// Automatically sets validationErrors.email

formData.value = { ...formData.value, email: 'user@example.com' };
// Automatically clears validationErrors.email`}
      />

      <h3>Real-time Data Synchronization</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const isConnected = state(false, 'isConnected');
const room = state('general', 'room');
const messages = state([], 'messages');
const connectionStatus = state('disconnected', 'connectionStatus');

let websocket: WebSocket | null = null;

// WebSocket connection management
effect(() => {
  if (isConnected.value && room.value) {
    connectionStatus.value = 'connecting';
    
    const ws = new WebSocket(\`ws://localhost:8080/rooms/\${room.value}\`);
    websocket = ws;
    
    ws.onopen = () => {
      connectionStatus.value = 'connected';
      console.log(\`Connected to room: \${room.value}\`);
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      messages.value = [...messages.value, message];
    };
    
    ws.onclose = () => {
      connectionStatus.value = 'disconnected';
      console.log('WebSocket connection closed');
    };
    
    ws.onerror = (error) => {
      connectionStatus.value = 'error';
      console.error('WebSocket error:', error);
    };
    
    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      websocket = null;
    };
  } else {
    connectionStatus.value = 'disconnected';
    messages.value = [];
  }
}, 'manageWebSocket');

// Usage
isConnected.value = true;   // Connects to WebSocket
room.value = 'developers';  // Switches to different room (reconnects)
isConnected.value = false;  // Disconnects and cleans up`}
      />

      <h2>Performance Optimization</h2>

      <h3>Conditional Effects</h3>
      <p>Use early returns to avoid unnecessary work:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const user = state(null, 'user');
const userSettings = state(null, 'userSettings');
const isOnline = state(true, 'isOnline');

effect(async () => {
  // Early return if conditions not met
  if (!user.value || !isOnline.value) {
    userSettings.value = null;
    return;
  }
  
  // Only fetch when user is logged in and online
  try {
    const response = await fetch(\`/api/users/\${user.value.id}/settings\`);
    userSettings.value = await response.json();
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
}, 'loadUserSettings');`}
      />

      <h3>Debouncing Effects</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const searchTerm = state('', 'searchTerm');
const searchResults = state([], 'searchResults');

let searchTimeout: NodeJS.Timeout;

effect(() => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  const term = searchTerm.value;
  
  if (!term.trim()) {
    searchResults.value = [];
    return;
  }
  
  // Debounce the search by 300ms
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(\`/api/search?q=\${encodeURIComponent(term)}\`);
      const results = await response.json();
      searchResults.value = results;
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, 300);
  
  // Cleanup timeout on effect disposal
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };
}, 'debouncedSearch');`}
      />

      <h2>Error Handling</h2>
      <p>Properly handle errors in async effects:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const dataId = state(1, 'dataId');
const data = state(null, 'data');
const error = state(null, 'error');
const isLoading = state(false, 'isLoading');

effect(async ({ signal }) => {
  if (!dataId.value) {
    data.value = null;
    error.value = null;
    return;
  }

  isLoading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(\`/api/data/\${dataId.value}\`, { signal });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    const result = await response.json();
    data.value = result;
    
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Request was cancelled');
      return;
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    error.value = errorMessage;
    data.value = null;
    
    console.error(\`Failed to load data for ID \${dataId.value}:\`, err);
    
  } finally {
    isLoading.value = false;
  }
}, 'loadData', { preventOverlap: true });`}
      />

      <h2>Testing Effects</h2>
      <p>Test effects by verifying their side effects:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

// Mock localStorage for testing
const mockLocalStorage = {
  data: {} as Record<string, string>,
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value;
  }),
  getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
  clear: jest.fn(() => { mockLocalStorage.data = {}; })
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Preferences Effect', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should save preferences to localStorage', () => {
    const preferences = state({ theme: 'light' });
    
    // Create the effect
    effect(() => {
      localStorage.setItem('prefs', JSON.stringify(preferences.value));
    });
    
    // Verify initial save
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'prefs', 
      JSON.stringify({ theme: 'light' })
    );
    
    // Update preferences
    preferences.value = { theme: 'dark' };
    
    // Verify update was saved
    expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
      'prefs',
      JSON.stringify({ theme: 'dark' })
    );
  });
  
  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    const preferences = state({ theme: 'light' });
    
    effect(() => {
      try {
        localStorage.setItem('prefs', JSON.stringify(preferences.value));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save preferences:', 
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});`}
      />

      <h2>Debugging Effects</h2>
      <CodeBlock
        language="tsx"
        code={`import { state, effect, configureDebug } from 'react-understate';

// Enable debugging globally
configureDebug({ enabled: true, showFile: true });

const count = state(0, 'counter');
const user = state(null, 'user');

// Named effects for better debugging
effect(() => {
  console.log(\`Counter effect: count is \${count.value}\`);
}, 'logCounter');

effect(async ({ signal }) => {
  if (user.value) {
    console.log(\`User effect: loading data for \${user.value.name}\`);
    // Async operations...
  }
}, 'loadUserData', { preventOverlap: true });

// Debug output will show:
// [effect: logCounter] Effect running
// [effect: loadUserData] Effect running (async)
// [effect: loadUserData] Effect completed in 150ms

count.value = 5;
// [effect: logCounter] Effect running (triggered by counter)`}
      />

      <h2>Best Practices</h2>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>✅ Single Responsibility</div>
          <div className={styles.featureDescription}>
            Keep effects focused on one specific side effect or concern.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧹 Always Cleanup</div>
          <div className={styles.featureDescription}>
            Return cleanup functions for timers, subscriptions, and resources.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🚫 Avoid Loops</div>
          <div className={styles.featureDescription}>
            Don't modify states that the effect depends on unless necessary.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Use Conditions</div>
          <div className={styles.featureDescription}>
            Use early returns and conditions to prevent unnecessary work.
          </div>
        </div>
      </div>

      <h3>Effects vs Derived Values</h3>
      <p>Choose the right tool for the job:</p>

      <CodeBlock
        language="tsx"
        code={`// ✅ Use derived for computed state
const fullName = derived(() => \`\${firstName.value} \${lastName.value}\`);

// ✅ Use effects for side effects
effect(() => {
  localStorage.setItem('user', JSON.stringify(user.value));
});

// ❌ Don't use effects for computations
effect(() => {
  fullName.value = \`\${firstName.value} \${lastName.value}\`; // Wrong!
});

// ❌ Don't use derived for side effects
const saveUser = derived(() => {
  localStorage.setItem('user', JSON.stringify(user.value)); // Wrong!
  return user.value;
});`}
      />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/action" className={styles.navLink}>
            ← action()
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/batch" className={styles.navLink}>
            batch() →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EffectAPIContent;
