// Storage utilities with error handling
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
);