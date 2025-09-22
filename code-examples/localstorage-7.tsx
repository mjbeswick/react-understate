import React, { useEffect } from 'react';
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

export { SettingsPanel, SimplePersistedComponent };