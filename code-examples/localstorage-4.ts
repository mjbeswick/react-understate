// Migration utilities
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
          console.log(`Migrating data from ${oldKey} to ${currentKey}`);
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
);