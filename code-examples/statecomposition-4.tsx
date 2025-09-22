import { state, derived, action } from 'react-understate';

// Base user state
const userState = {
  profile: state({ id: null, name: '', email: '' }),
  isAuthenticated: state(false),
  
  login: action(async (credentials) => {
    // Login logic...
    userState.isAuthenticated.value = true;
  }, 'login'),
  
  logout: action(() => {
    userState.profile.value = { id: null, name: '', email: '' };
    userState.isAuthenticated.value = false;
  }, 'logout'),
};

// Preferences that depend on user
const preferencesState = {
  theme: state('light'),
  language: state('en'),
  notifications: state(true),
  
  // Derived from user state
  canEdit: derived(() => userState.isAuthenticated.value),
  
  updateTheme: action((theme) => {
    if (preferencesState.canEdit.value) {
      preferencesState.theme.value = theme;
    }
  }, 'updateTheme'),
};

// Settings that depend on both user and preferences
const settingsState = {
  autoSave: state(true),
  syncEnabled: state(false),
  
  // Derived from multiple states
  isFullyConfigured: derived(() => {
    return userState.isAuthenticated.value && 
           preferencesState.theme.value !== 'light' &&
           settingsState.autoSave.value;
  }),
  
  // Actions that work across modules
  resetAll: action(() => {
    preferencesState.theme.value = 'light';
    preferencesState.language.value = 'en';
    settingsState.autoSave.value = true;
    settingsState.syncEnabled.value = false;
  }, 'resetAll'),
};