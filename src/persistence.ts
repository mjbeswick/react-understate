import type { State } from './core';
import { effect } from './effects';

/**
 * Persists a React Understate state to localStorage
 * @param state - The state to persist
 * @param key - The key to store the state under in localStorage
 * @param options - Optional configuration
 */
export function persistLocalStorage<T>(
  state: State<T>,
  key: string,
  options: {
    /** Whether to load initial value from storage on first call */
    loadInitial?: boolean;
    /** Whether to sync changes from other tabs/windows */
    syncAcrossTabs?: boolean;
    /** Custom serializer (defaults to JSON.stringify) */
    serialize?: (value: T) => string;
    /** Custom deserializer (defaults to JSON.parse) */
    deserialize?: (value: string) => T;
    /** Error handler for persistence failures */
    onError?: (error: Error) => void;
  } = {},
) {
  if (typeof window === 'undefined') {
    // localStorage is not available in this environment
    return () => {}; // Return no-op dispose function
  }

  const {
    loadInitial = true,
    syncAcrossTabs = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = _error => {
      // Silent error handling - persistence failures are non-critical
    },
  } = options;

  // Load initial value from storage if requested
  if (loadInitial) {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsedValue = deserialize(saved);
        state.value = parsedValue;
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // Set up effect to persist changes
  const disposeEffect = effect(() => {
    try {
      const serialized = serialize(state.value);
      localStorage.setItem(key, serialized);
    } catch (error) {
      onError(error as Error);
    }
  });

  // Set up storage event listener to sync across tabs
  let disposeStorageListener: (() => void) | undefined;

  if (syncAcrossTabs) {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === localStorage) {
        try {
          if (event.newValue !== null) {
            const parsedValue = deserialize(event.newValue);
            state.value = parsedValue;
          }
        } catch (error) {
          onError(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    disposeStorageListener = () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Return dispose function for cleanup
  return () => {
    disposeEffect();
    disposeStorageListener?.();
  };
}

/**
 * Persists a React Understate state to sessionStorage
 * @param state - The state to persist
 * @param key - The key to store the state under in sessionStorage
 * @param options - Optional configuration
 */
export function persistSessionStorage<T>(
  state: State<T>,
  key: string,
  options: {
    /** Whether to load initial value from storage on first call */
    loadInitial?: boolean;
    /** Whether to sync changes from other tabs/windows */
    syncAcrossTabs?: boolean;
    /** Custom serializer (defaults to JSON.stringify) */
    serialize?: (value: T) => string;
    /** Custom deserializer (defaults to JSON.parse) */
    deserialize?: (value: string) => T;
    /** Error handler for persistence failures */
    onError?: (error: Error) => void;
  } = {},
) {
  if (typeof window === 'undefined') {
    // sessionStorage is not available in this environment
    return () => {}; // Return no-op dispose function
  }

  const {
    loadInitial = true,
    syncAcrossTabs = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = _error => {
      // Silent error handling - persistence failures are non-critical
    },
  } = options;

  // Load initial value from storage if requested
  if (loadInitial) {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved !== null) {
        const parsedValue = deserialize(saved);
        state.value = parsedValue;
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // Set up effect to persist changes
  const disposeEffect = effect(() => {
    try {
      const serialized = serialize(state.value);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      onError(error as Error);
    }
  });

  // Set up storage event listener to sync across tabs
  let disposeStorageListener: (() => void) | undefined;

  if (syncAcrossTabs) {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === sessionStorage) {
        try {
          if (event.newValue !== null) {
            const parsedValue = deserialize(event.newValue);
            state.value = parsedValue;
          }
        } catch (error) {
          onError(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    disposeStorageListener = () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Return dispose function for cleanup
  return () => {
    disposeEffect();
    disposeStorageListener?.();
  };
}

/**
 * Persists multiple states with a single key prefix
 * @param states - Object with state names as keys and states as values
 * @param keyPrefix - Prefix for storage keys
 * @param storage - Storage implementation (defaults to sessionStorage)
 */
export function persistStates<T extends Record<string, State<unknown>>>(
  states: T,
  keyPrefix: string,
  storage: Storage = typeof window !== 'undefined'
    ? sessionStorage
    : ({} as Storage),
) {
  const disposers: (() => void)[] = [];

  for (const [name, state] of Object.entries(states)) {
    const key = `${keyPrefix}.${name}`;

    // Load initial value from storage
    try {
      const saved = storage.getItem(key);
      if (saved !== null) {
        const parsedValue = JSON.parse(saved);
        state.value = parsedValue;
      }
    } catch {
      // Silent error handling - persistence failures are non-critical
    }

    // Set up effect to persist changes
    const disposeEffect = effect(() => {
      try {
        const serialized = JSON.stringify(state.value);
        storage.setItem(key, serialized);
      } catch {
        // Silent error handling - persistence failures are non-critical
      }
    });

    // Set up storage event listener to sync across tabs
    let disposeStorageListener: (() => void) | undefined;

    if (
      typeof window !== 'undefined' &&
      (storage === window.localStorage || storage === window.sessionStorage)
    ) {
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key && event.storageArea === storage) {
          try {
            if (event.newValue !== null) {
              const parsedValue = JSON.parse(event.newValue);
              state.value = parsedValue;
            }
          } catch {
            // Silent error handling - persistence failures are non-critical
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      disposeStorageListener = () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }

    disposers.push(() => {
      disposeEffect();
      disposeStorageListener?.();
    });
  }

  // Return function to dispose all effects
  return () => disposers.forEach(dispose => dispose());
}
