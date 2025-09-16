import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const Effects: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Effects Guide</h1>
        <p className={styles.subtitle}>
          Master side effects and reactive programming with effects
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/effects" className={styles.navLink}>
            Effects
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        Effects are the reactive side of React Understate, allowing you to
        respond to state changes with side effects like API calls, DOM
        manipulation, timers, and more. They provide a clean way to handle
        complex reactive logic while maintaining excellent performance.
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
          <li>Creating and managing effects</li>
          <li>Dependency tracking and cleanup</li>
          <li>Common effect patterns</li>
          <li>Performance optimization</li>
          <li>Error handling and debugging</li>
          <li>Best practices and anti-patterns</li>
        </ul>
      </div>

      <h2>Basic Effects</h2>
      <p>
        The `effect()` function creates reactive side effects that automatically
        run when their dependencies change and clean up when dependencies change
        or the effect is disposed.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, effect } from 'react-understate';

// Basic state
const count = state(0, { name: 'count' });
const isVisible = state(true, { name: 'isVisible' });

// Simple effect
export const logCountEffect = effect(() => {
  console.log('effect: count changed to', count());
}, { name: 'logCountEffect' });

// Effect with conditional logic
export const visibilityEffect = effect(() => {
  const visible = isVisible();
  
  if (visible) {
    console.log('effect: element is now visible');
    document.title = \`Count: \${count()}\`;
  } else {
    console.log('effect: element is now hidden');
    document.title = 'Hidden';
  }
}, { name: 'visibilityEffect' });

// Effect with cleanup
export const intervalEffect = effect(() => {
  const interval = setInterval(() => {
    console.log('effect: interval tick, count is', count());
  }, 1000);
  
  // Cleanup function
  return () => {
    console.log('effect: cleaning up interval');
    clearInterval(interval);
  };
}, { name: 'intervalEffect' });`}
      />

      <h2>Effect Dependencies</h2>
      <p>
        Effects automatically track their dependencies and re-run when any
        dependency changes. Understanding dependency tracking is crucial for
        writing efficient effects.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Multiple dependencies
const user = state({ id: 1, name: 'John' }, { name: 'user' });
const theme = state('light', { name: 'theme' });
const language = state('en', { name: 'language' });

// Effect depends on all three
export const userPreferencesEffect = effect(() => {
  const userData = user();
  const currentTheme = theme();
  const currentLanguage = language();
  
  console.log('effect: user preferences changed', {
    user: userData.name,
    theme: currentTheme,
    language: currentLanguage,
  });
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Set language
  document.documentElement.lang = currentLanguage;
}, { name: 'userPreferencesEffect' });

// Conditional dependencies
const showAdvancedFeatures = state(false, { name: 'showAdvancedFeatures' });
const advancedData = state(null, { name: 'advancedData' });

export const conditionalEffect = effect(() => {
  const showAdvanced = showAdvancedFeatures();
  
  if (showAdvanced) {
    // Only depends on advancedData when showAdvanced is true
    const data = advancedData();
    console.log('effect: processing advanced data', data);
  } else {
    console.log('effect: advanced features disabled');
  }
}, { name: 'conditionalEffect' });

// Derived dependencies
const firstName = state('John', { name: 'firstName' });
const lastName = state('Doe', { name: 'lastName' });

const fullName = derived(() => \`\${firstName()} \${lastName()}\`, {
  name: 'fullName',
});

export const nameEffect = effect(() => {
  const name = fullName();
  console.log('effect: full name changed to', name);
  
  // This effect will re-run when either firstName or lastName changes
  // because it depends on the derived fullName
}, { name: 'nameEffect' });`}
      />

      <h2>Common Effect Patterns</h2>
      <p>
        Here are the most common patterns for using effects in real
        applications.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. API synchronization
const userId = state<number | null>(null, { name: 'userId' });
const userData = state<any>(null, { name: 'userData' });
const loading = state(false, { name: 'loading' });
const error = state<string | null>(null, { name: 'error' });

export const userSyncEffect = effect(() => {
  const id = userId();
  
  if (!id) {
    userData(null);
    return;
  }
  
  loading(true);
  error(null);
  
  let cancelled = false;
  
  fetchUser(id)
    .then(data => {
      if (!cancelled) {
        userData(data);
        loading(false);
      }
    })
    .catch(err => {
      if (!cancelled) {
        error(err.message);
        loading(false);
      }
    });
  
  return () => {
    cancelled = true;
  };
}, { name: 'userSyncEffect' });

// 2. Local storage persistence
const settings = state({
  theme: 'light',
  language: 'en',
  notifications: true,
}, { name: 'settings' });

export const settingsPersistenceEffect = effect(() => {
  const currentSettings = settings();
  
  try {
    localStorage.setItem('app-settings', JSON.stringify(currentSettings));
  } catch (error) {
    console.error('effect: failed to save settings', error);
  }
}, { name: 'settingsPersistenceEffect' });

// Load settings on initialization
export const loadSettingsEffect = effect(() => {
  try {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings(parsed);
    }
  } catch (error) {
    console.error('effect: failed to load settings', error);
  }
}, { name: 'loadSettingsEffect' });

// 3. Document title updates
const pageTitle = state('Home', { name: 'pageTitle' });
const unreadCount = state(0, { name: 'unreadCount' });

export const documentTitleEffect = effect(() => {
  const title = pageTitle();
  const unread = unreadCount();
  
  const fullTitle = unread > 0 ? \`(\${unread}) \${title}\` : title;
  document.title = \`\${fullTitle} - My App\`;
}, { name: 'documentTitleEffect' });

// 4. Analytics tracking
const currentPage = state('/', { name: 'currentPage' });
const user = state(null, { name: 'user' });

export const analyticsEffect = effect(() => {
  const page = currentPage();
  const userData = user();
  
  // Track page views
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
  
  // Track user events
  if (userData) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'user_login', {
        user_id: userData.id,
      });
    }
  }
}, { name: 'analyticsEffect' });

// 5. WebSocket connections
const isConnected = state(false, { name: 'isConnected' });
const messages = state<any[]>([], { name: 'messages' });

export const websocketEffect = effect(() => {
  const connected = isConnected();
  
  if (!connected) return;
  
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('effect: websocket connected');
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    messages(prev => [...prev, message]);
  };
  
  ws.onclose = () => {
    console.log('effect: websocket disconnected');
    isConnected(false);
  };
  
  ws.onerror = (error) => {
    console.error('effect: websocket error', error);
    isConnected(false);
  };
  
  return () => {
    console.log('effect: closing websocket');
    ws.close();
  };
}, { name: 'websocketEffect' });`}
      />

      <h2>Advanced Effect Patterns</h2>
      <p>More sophisticated patterns for complex reactive scenarios.</p>

      <CodeBlock
        language="typescript"
        code={`// 1. Debounced effects
const createDebouncedEffect = <T>(
  computation: () => T,
  delay: number,
  name: string
) => {
  let timeoutId: number | null = null;
  
  return effect(() => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = window.setTimeout(() => {
      computation();
      timeoutId = null;
    }, delay);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, { name });
};

// Usage: Debounced search
const searchQuery = state('', { name: 'searchQuery' });
const searchResults = state<any[]>([], { name: 'searchResults' });

export const debouncedSearchEffect = createDebouncedEffect(
  () => {
    const query = searchQuery();
    if (!query.trim()) {
      searchResults([]);
      return;
    }
    
    performSearch(query).then(results => {
      searchResults(results);
    });
  },
  300,
  'debouncedSearchEffect'
);

// 2. Effect chains
const data = state<any[]>([], { name: 'data' });
const filtered = state<any[]>([], { name: 'filtered' });
const sorted = state<any[]>([], { name: 'sorted' });

// First effect: filter data
export const filterEffect = effect(() => {
  const items = data();
  const filteredItems = items.filter(item => item.active);
  filtered(filteredItems);
}, { name: 'filterEffect' });

// Second effect: sort filtered data
export const sortEffect = effect(() => {
  const items = filtered();
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  sorted(sortedItems);
}, { name: 'sortEffect' });`}
      />

      <h2>Next Steps</h2>
      <p>Now that you understand effects, explore these related topics:</p>

      <div className={styles.navigation}>
        <Link to="/guides/batching" className={styles.navLink}>
          Batching Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/local-storage" className={styles.navLink}>
          Local Storage
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/effect" className={styles.navLink}>
          effect() API Reference
        </Link>
      </div>
    </div>
  );
};

export default Effects;
