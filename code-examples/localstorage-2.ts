import { state, derived, action, effect, persistLocalStorage } from 'react-understate';

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
}, { name: 'updateWorkspace' });