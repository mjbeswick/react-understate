import { state, effect } from 'react-understate';

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
}; // Automatically saves to localStorage