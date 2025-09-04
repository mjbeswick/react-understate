import { State } from "./core";
import { effect } from "./effects";

/**
 * Generic function to persist a React Understate state to any storage
 * @param state - The state to persist
 * @param key - The key to store the state under
 * @param storage - Storage implementation (localStorage, sessionStorage, or custom)
 * @param options - Optional configuration
 */
export function persistStorage<T>(
  state: State<T>,
  key: string,
  storage: Storage,
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
  const {
    loadInitial = true,
    syncAcrossTabs = true,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = (error) =>
      console.warn(`Failed to persist state "${key}":`, error),
  } = options;

  // Load initial value from storage if requested
  if (loadInitial) {
    try {
      const saved = storage.getItem(key);
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
      storage.setItem(key, serialized);
    } catch (error) {
      onError(error as Error);
    }
  });

  // Set up storage event listener to sync across tabs (only for localStorage/sessionStorage)
  let disposeStorageListener: (() => void) | undefined;

  if (
    syncAcrossTabs &&
    typeof window !== "undefined" &&
    (storage === window.localStorage ||
      storage === window.sessionStorage ||
      storage.constructor.name === "MockStorage")
  ) {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === storage) {
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

    window.addEventListener("storage", handleStorageChange);
    disposeStorageListener = () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }

  // Return dispose function for cleanup
  return () => {
    disposeEffect();
    disposeStorageListener?.();
  };
}

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
  if (typeof window === "undefined") {
    console.warn("localStorage is not available in this environment");
    return () => {}; // Return no-op dispose function
  }

  return persistStorage(state, key, localStorage, options);
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
  if (typeof window === "undefined") {
    console.warn("sessionStorage is not available in this environment");
    return () => {}; // Return no-op dispose function
  }

  return persistStorage(state, key, sessionStorage, options);
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
  storage: Storage = typeof window !== "undefined"
    ? sessionStorage
    : ({} as Storage),
) {
  const disposers: (() => void)[] = [];

  for (const [name, state] of Object.entries(states)) {
    const key = `${keyPrefix}.${name}`;
    const dispose = persistStorage(state, key, storage, { loadInitial: true });
    disposers.push(dispose);
  }

  // Return function to dispose all effects
  return () => disposers.forEach((dispose) => dispose());
}
