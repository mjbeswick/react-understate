import { state, derived, action, persistLocalStorage } from 'react-understate';

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
}, { name: 'updatePreferences' });