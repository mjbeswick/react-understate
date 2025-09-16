import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const LocalStorage: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Local Storage Persistence</h1>
        <p className={styles.subtitle}>
          Persist state to localStorage with automatic hydration and
          synchronization
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Pattern:</span>
          <Link to="/patterns" className={styles.navLink}>
            Patterns
          </Link>
          <span className={styles.navLabel}>/</span>
          <span>Local Storage</span>
        </div>
      </nav>

      <h2>Overview</h2>
      <p>
        Local storage persistence allows your application state to survive page
        reloads and browser sessions. React Understate provides built-in
        persistence utilities that handle serialization, hydration, and
        synchronization automatically.
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
          <li>Automatic serialization and deserialization</li>
          <li>Type-safe persistence with TypeScript</li>
          <li>Selective state persistence</li>
          <li>Cross-tab synchronization</li>
          <li>Error handling for corrupted data</li>
          <li>Custom serialization strategies</li>
        </ul>
      </div>

      <h2>Basic localStorage Integration</h2>
      <p>
        First, let's look at the built-in persistence utilities that React
        Understate provides:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action, persistLocalStorage } from 'react-understate';

// Simple persistent state
export const theme = state('light', {
  name: 'theme',
  persist: persistLocalStorage('app-theme'),
});

export const userPreferences = state({
  language: 'en',
  notifications: true,
  autoSave: true,
}, {
  name: 'userPreferences',
  persist: persistLocalStorage('user-preferences'),
});

// The state will automatically load from localStorage on initialization
// and save to localStorage whenever it changes

// Actions to modify persistent state
export const setTheme = action((newTheme: 'light' | 'dark') => {
  console.log('action: setting theme to', newTheme);
  theme(newTheme); // Automatically persisted
}, { name: 'setTheme' });

export const updatePreferences = action((updates: Partial<typeof userPreferences>) => {
  console.log('action: updating preferences', updates);
  userPreferences(prev => ({ ...prev, ...updates }));
}, { name: 'updatePreferences' });`}
      />

      <h2>Advanced Persistence Store</h2>
      <p>
        For more complex scenarios, create a comprehensive persistence store
        that handles multiple data types and error recovery:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action, effect, persistLocalStorage } from 'react-understate';

// Types
type UserSettings = {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    analytics: boolean;
    tracking: boolean;
  };
};

type AppData = {
  recentFiles: string[];
  bookmarks: { id: string; name: string; url: string }[];
  workspace: {
    sidebar: boolean;
    panels: Record<string, boolean>;
  };
};

// Default values
const defaultSettings: UserSettings = {
  theme: 'auto',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  notifications: {
    email: true,
    push: true,
    sound: false,
  },
  privacy: {
    analytics: false,
    tracking: false,
  },
};

const defaultAppData: AppData = {
  recentFiles: [],
  bookmarks: [],
  workspace: {
    sidebar: true,
    panels: {},
  },
};

// Persistent state
export const userSettings = state(defaultSettings, {
  name: 'userSettings',
  persist: persistLocalStorage('user-settings-v2'), // Version in key for migrations
});

export const appData = state(defaultAppData, {
  name: 'appData',
  persist: persistLocalStorage('app-data-v1'),
});

// Non-persistent state for session data
export const sessionData = state({
  lastActivity: new Date(),
  currentTab: 'main',
  tempData: null as any,
}, { name: 'sessionData' });

// Derived values from persistent state
export const isDarkMode = derived(() => {
  const theme = userSettings().theme;
  if (theme === 'auto') {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return theme === 'dark';
}, { name: 'isDarkMode' });

export const effectiveLanguage = derived(() => {
  const lang = userSettings().language;
  // Fallback to browser language if not set
  return lang || navigator.language.split('-')[0];
}, { name: 'effectiveLanguage' });

export const notificationSettings = derived(() => {
  return userSettings().notifications;
}, { name: 'notificationSettings' });

// Actions for settings
export const updateUserSettings = action((updates: Partial<UserSettings>) => {
  console.log('action: updating user settings', updates);
  userSettings(prev => ({
    ...prev,
    ...updates,
    // Deep merge nested objects
    notifications: updates.notifications 
      ? { ...prev.notifications, ...updates.notifications }
      : prev.notifications,
    privacy: updates.privacy
      ? { ...prev.privacy, ...updates.privacy }
      : prev.privacy,
  }));
}, { name: 'updateUserSettings' });

export const toggleTheme = action(() => {
  const current = userSettings().theme;
  const next = current === 'light' ? 'dark' : 'light';
  console.log('action: toggling theme from', current, 'to', next);
  updateUserSettings({ theme: next });
}, { name: 'toggleTheme' });

export const resetSettings = action(() => {
  console.log('action: resetting settings to defaults');
  userSettings(defaultSettings);
}, { name: 'resetSettings' });

// Actions for app data
export const addRecentFile = action((filePath: string) => {
  console.log('action: adding recent file', filePath);
  appData(prev => ({
    ...prev,
    recentFiles: [
      filePath,
      ...prev.recentFiles.filter(f => f !== filePath).slice(0, 9) // Keep 10 max
    ],
  }));
}, { name: 'addRecentFile' });

export const addBookmark = action((bookmark: { name: string; url: string }) => {
  console.log('action: adding bookmark', bookmark);
  const id = Date.now().toString();
  appData(prev => ({
    ...prev,
    bookmarks: [...prev.bookmarks, { ...bookmark, id }],
  }));
}, { name: 'addBookmark' });

export const removeBookmark = action((id: string) => {
  console.log('action: removing bookmark', id);
  appData(prev => ({
    ...prev,
    bookmarks: prev.bookmarks.filter(b => b.id !== id),
  }));
}, { name: 'removeBookmark' });

export const updateWorkspace = action((updates: Partial<AppData['workspace']>) => {
  console.log('action: updating workspace', updates);
  appData(prev => ({
    ...prev,
    workspace: { ...prev.workspace, ...updates },
  }));
}, { name: 'updateWorkspace' });`}
      />

      <h2>Cross-Tab Synchronization</h2>
      <p>
        Keep state synchronized across multiple browser tabs using storage
        events:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { effect } from 'react-understate';

// Effect to sync changes across tabs
export const crossTabSyncEffect = effect(() => {
  console.log('effect: setting up cross-tab sync');
  
  const handleStorageChange = (event: StorageEvent) => {
    if (!event.key || !event.newValue) return;
    
    try {
      // Handle user settings sync
      if (event.key === 'user-settings-v2') {
        const newSettings = JSON.parse(event.newValue);
        console.log('effect: syncing user settings from other tab');
        userSettings(newSettings);
      }
      
      // Handle app data sync
      if (event.key === 'app-data-v1') {
        const newAppData = JSON.parse(event.newValue);
        console.log('effect: syncing app data from other tab');
        appData(newAppData);
      }
    } catch (error) {
      console.error('effect: failed to sync from other tab', error);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, { name: 'crossTabSyncEffect' });

// Manual sync trigger (useful for testing or forced sync)
export const syncFromStorage = action(() => {
  console.log('action: manually syncing from storage');
  
  try {
    const settingsData = localStorage.getItem('user-settings-v2');
    if (settingsData) {
      userSettings(JSON.parse(settingsData));
    }
    
    const appDataStr = localStorage.getItem('app-data-v1');
    if (appDataStr) {
      appData(JSON.parse(appDataStr));
    }
  } catch (error) {
    console.error('action: failed to sync from storage', error);
  }
}, { name: 'syncFromStorage' });`}
      />

      <h2>Migration and Versioning</h2>
      <p>Handle data migrations when your state structure changes:</p>

      <CodeBlock
        language="typescript"
        code={`// Migration utilities
type Migration<T> = (oldData: any) => T;

const settingsMigrations: Record<string, Migration<UserSettings>> = {
  'user-settings-v1': (oldData) => {
    // Migrate from v1 to v2 structure
    return {
      theme: oldData.darkMode ? 'dark' : 'light', // Changed from boolean to string
      language: oldData.lang || 'en', // Renamed field
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // New field
      notifications: {
        email: oldData.emailNotifications ?? true,
        push: oldData.pushNotifications ?? true,
        sound: false, // New field
      },
      privacy: {
        analytics: false, // New section
        tracking: false,
      },
    };
  },
};

// Custom persistence with migration support
export const createMigratedState = <T>(
  defaultValue: T,
  currentKey: string,
  migrations: Record<string, Migration<T>> = {}
) => {
  // Try to load from current version first
  let initialValue = defaultValue;
  
  try {
    const currentData = localStorage.getItem(currentKey);
    if (currentData) {
      initialValue = JSON.parse(currentData);
    } else {
      // Look for old versions and migrate
      for (const [oldKey, migrate] of Object.entries(migrations)) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          console.log(\`Migrating data from \${oldKey} to \${currentKey}\`);
          initialValue = migrate(JSON.parse(oldData));
          
          // Clean up old key
          localStorage.removeItem(oldKey);
          break;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load or migrate data, using defaults:', error);
    initialValue = defaultValue;
  }
  
  return state(initialValue, {
    name: currentKey,
    persist: persistLocalStorage(currentKey),
  });
};

// Usage with migration
export const migratedUserSettings = createMigratedState(
  defaultSettings,
  'user-settings-v2',
  settingsMigrations
);`}
      />

      <h2>Selective Persistence</h2>
      <p>Sometimes you only want to persist certain parts of your state:</p>

      <CodeBlock
        language="typescript"
        code={`// State with mixed persistence needs
export const editorState = state({
  // Persistent data
  settings: {
    fontSize: 14,
    theme: 'vs-dark',
    wordWrap: true,
  },
  recentFiles: [] as string[],
  
  // Session-only data (not persisted)
  currentFile: null as string | null,
  isLoading: false,
  errors: [] as string[],
}, { name: 'editorState' });

// Derived state for persistent parts only
export const persistentEditorData = derived(() => {
  const state = editorState();
  return {
    settings: state.settings,
    recentFiles: state.recentFiles,
  };
}, { name: 'persistentEditorData' });

// Effect to save only persistent data
export const saveEditorDataEffect = effect(() => {
  const persistentData = persistentEditorData();
  
  try {
    localStorage.setItem('editor-data', JSON.stringify(persistentData));
  } catch (error) {
    console.error('effect: failed to save editor data', error);
  }
}, { name: 'saveEditorDataEffect' });

// Action to load persistent data
export const loadEditorData = action(() => {
  console.log('action: loading editor data');
  
  try {
    const saved = localStorage.getItem('editor-data');
    if (saved) {
      const persistentData = JSON.parse(saved);
      
      editorState(prev => ({
        ...prev,
        settings: persistentData.settings || prev.settings,
        recentFiles: persistentData.recentFiles || prev.recentFiles,
        // Keep session data unchanged
      }));
    }
  } catch (error) {
    console.error('action: failed to load editor data', error);
  }
}, { name: 'loadEditorData' });

// Custom persistence for complex scenarios
export const createSelectivePersistence = <T, K extends keyof T>(
  stateInstance: any,
  storageKey: string,
  persistentKeys: K[]
) => {
  // Save effect
  const saveEffect = effect(() => {
    const fullState = stateInstance();
    const persistentData = persistentKeys.reduce((acc, key) => {
      acc[key] = fullState[key];
      return acc;
    }, {} as Pick<T, K>);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(persistentData));
    } catch (error) {
      console.error(\`Failed to persist \${storageKey}\`, error);
    }
  }, { name: \`save-\${storageKey}\` });
  
  // Load action
  const loadAction = action(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const persistentData = JSON.parse(saved);
        stateInstance((prev: T) => ({ ...prev, ...persistentData }));
      }
    } catch (error) {
      console.error(\`Failed to load \${storageKey}\`, error);
    }
  }, { name: \`load-\${storageKey}\` });
  
  return { saveEffect, loadAction };
};

// Usage
const { saveEffect: saveUIEffect, loadAction: loadUIData } = 
  createSelectivePersistence(
    editorState,
    'ui-settings',
    ['settings', 'recentFiles'] // Only these keys will be persisted
  );`}
      />

      <h2>Error Handling and Recovery</h2>
      <p>Robust error handling for localStorage operations:</p>

      <CodeBlock
        language="typescript"
        code={`// Storage utilities with error handling
export const storageUtils = {
  // Safe get with fallback
  get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(\`Failed to read from localStorage[\${key}]\`, error);
      return fallback;
    }
  },
  
  // Safe set with error handling
  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(\`Failed to write to localStorage[\${key}]\`, error);
      
      // Handle quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting cleanup');
        this.cleanup();
        
        // Retry once after cleanup
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Failed to write after cleanup', retryError);
        }
      }
      
      return false;
    }
  },
  
  // Remove with error handling
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(\`Failed to remove localStorage[\${key}]\`, error);
      return false;
    }
  },
  
  // Clean up old or large items
  cleanup() {
    console.log('Cleaning up localStorage');
    
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        items.push({
          key,
          size: value ? value.length : 0,
          value,
        });
      }
    }
    
    // Sort by size, remove largest items first
    items.sort((a, b) => b.size - a.size);
    
    // Remove items until we free up some space
    let freedSpace = 0;
    const targetSpace = 1024 * 1024; // 1MB
    
    for (const item of items) {
      // Skip essential items (you might want to customize this)
      if (item.key.startsWith('essential-')) continue;
      
      localStorage.removeItem(item.key);
      freedSpace += item.size;
      
      console.log(\`Removed \${item.key} (\${item.size} bytes)\`);
      
      if (freedSpace >= targetSpace) break;
    }
    
    console.log(\`Freed \${freedSpace} bytes from localStorage\`);
  },
  
  // Check available space (approximate)
  getUsage() {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value ? value.length : 0)) * 2; // UTF-16
      }
    }
    return totalSize;
  },
};

// Robust persistent state factory
export const createRobustPersistentState = <T>(
  defaultValue: T,
  storageKey: string,
  options: {
    validate?: (value: any) => value is T;
    maxSize?: number; // bytes
  } = {}
) => {
  const { validate, maxSize = 1024 * 1024 } = options; // 1MB default limit
  
  // Load initial value with validation
  const initialValue = (() => {
    const stored = storageUtils.get(storageKey, defaultValue);
    
    // Validate if validator provided
    if (validate && !validate(stored)) {
      console.warn(\`Invalid data in localStorage[\${storageKey}], using default\`);
      return defaultValue;
    }
    
    return stored;
  })();
  
  const stateInstance = state(initialValue, { name: storageKey });
  
  // Save effect with size checking
  const saveEffect = effect(() => {
    const currentValue = stateInstance();
    const serialized = JSON.stringify(currentValue);
    
    // Check size limit
    if (maxSize && serialized.length > maxSize) {
      console.warn(\`Data too large for localStorage[\${storageKey}]: \${serialized.length} bytes\`);
      return;
    }
    
    storageUtils.set(storageKey, currentValue);
  }, { name: \`save-\${storageKey}\` });
  
  return stateInstance;
};

// Usage with validation
type ValidatedSettings = {
  theme: 'light' | 'dark';
  version: number;
};

const isValidSettings = (value: any): value is ValidatedSettings => {
  return (
    value &&
    typeof value === 'object' &&
    ['light', 'dark'].includes(value.theme) &&
    typeof value.version === 'number'
  );
};

export const validatedSettings = createRobustPersistentState(
  { theme: 'light' as const, version: 1 },
  'app-settings-validated',
  {
    validate: isValidSettings,
    maxSize: 10 * 1024, // 10KB limit
  }
);`}
      />

      <h2>Using in React Components</h2>
      <p>Here's how to use localStorage patterns in your React components:</p>

      <CodeBlock
        language="tsx"
        code={`import React, { useEffect } from 'react';
import { useUnderstate } from 'react-understate';
import {
  userSettings,
  appData,
  isDarkMode,
  updateUserSettings,
  toggleTheme,
  addRecentFile,
  loadEditorData,
  crossTabSyncEffect,
} from './persistenceStore';

function SettingsPanel() {
  const settings = useUnderstate(userSettings);
  const darkMode = useUnderstate(isDarkMode);
  const data = useUnderstate(appData);

  useEffect(() => {
    // Initialize cross-tab sync
    crossTabSyncEffect;
    loadEditorData();
  }, []);

  return (
    <div className={darkMode ? 'dark-theme' : 'light-theme'}>
      <h2>Settings</h2>
      
      {/* Theme Toggle */}
      <div>
        <label>
          Theme:
          <select
            value={settings.theme}
            onChange={(e) => updateUserSettings({ 
              theme: e.target.value as 'light' | 'dark' | 'auto' 
            })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </label>
        <button onClick={toggleTheme}>Toggle</button>
      </div>

      {/* Language */}
      <div>
        <label>
          Language:
          <select
            value={settings.language}
            onChange={(e) => updateUserSettings({ language: e.target.value })}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </label>
      </div>

      {/* Notifications */}
      <div>
        <h3>Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.email}
            onChange={(e) => updateUserSettings({
              notifications: {
                ...settings.notifications,
                email: e.target.checked,
              },
            })}
          />
          Email notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.push}
            onChange={(e) => updateUserSettings({
              notifications: {
                ...settings.notifications,
                push: e.target.checked,
              },
            })}
          />
          Push notifications
        </label>
      </div>

      {/* Recent Files */}
      <div>
        <h3>Recent Files</h3>
        <button onClick={() => addRecentFile('/path/to/new/file.txt')}>
          Add Test File
        </button>
        <ul>
          {data.recentFiles.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      </div>

      {/* Storage Info */}
      <div>
        <h3>Storage Info</h3>
        <p>Current theme: {darkMode ? 'Dark' : 'Light'}</p>
        <p>Effective language: {settings.language}</p>
        <p>Total bookmarks: {data.bookmarks.length}</p>
      </div>
    </div>
  );
}

// Hook for localStorage with state
function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = React.useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = React.useCallback((newValue: T) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key]);

  return [value, setStoredValue] as const;
}

// Component using the hook
function SimplePersistedComponent() {
  const [count, setCount] = useLocalStorageState('simple-counter', 0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

export { SettingsPanel, SimplePersistedComponent };`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Use versioned keys:</strong> Include version numbers in
          storage keys for migrations
        </li>
        <li>
          <strong>Validate stored data:</strong> Always validate data loaded
          from localStorage
        </li>
        <li>
          <strong>Handle storage errors:</strong> localStorage can fail due to
          quotas or privacy settings
        </li>
        <li>
          <strong>Persist selectively:</strong> Don't persist temporary or
          sensitive data
        </li>
        <li>
          <strong>Implement cross-tab sync:</strong> Use storage events to keep
          tabs in sync
        </li>
        <li>
          <strong>Provide migration paths:</strong> Handle schema changes
          gracefully
        </li>
        <li>
          <strong>Monitor storage usage:</strong> Implement cleanup strategies
          for large data
        </li>
        <li>
          <strong>Use consistent naming:</strong> Follow a consistent pattern
          for storage keys
        </li>
      </ul>

      <h2>Related Patterns</h2>
      <div className={styles.navigation}>
        <Link to="/patterns/session-storage" className={styles.navLink}>
          Session Storage
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API
        </Link>
      </div>
    </div>
  );
};

export default LocalStorage;
