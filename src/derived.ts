/**
 * @fileoverview Derived Values
 *
 * This module provides reactive derived values functionality for the signals system.
 * Derived values are read-only signals that automatically update when their dependencies change.
 */

import { setActiveEffect, configureDebug, type State } from './core';
import { logDebug } from './debug-utils';

/**
 * Creates a read-only signal that automatically updates when dependencies change.
 *
 * Derived values are lazy and only recalculate when their value is accessed
 * and their dependencies have changed. This makes them efficient for derived
 * state that depends on multiple signals. They are read-only and cannot be
 * directly set or updated.
 *
 * @param computeFn - A function that computes the value based on other signals
 * @returns A read-only signal that automatically updates when dependencies change
 *
 * @example
 * ```tsx
 * import { signal } from './core';
 * import { derived } from './derived';
 *
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * // Create a derived signal that depends on multiple signals
 * const fullName = derived(() => `${firstName.value} ${lastName.value}`);
 *
 * console.log(fullName.value); // "John Doe"
 *
 * // Update one dependency - derived automatically updates
 * firstName.value = 'Jane';
 * console.log(fullName.value); // "Jane Doe"
 *
 * // Derived values are read-only
 * // fullName.value = 'Jane Smith'; // Error!
 * ```
 *
 * @example
 * ```tsx
 * // Complex derived values
 * const count = signal(0);
 * const multiplier = signal(2);
 * const isEven = signal(true);
 *
 * const result = derived(() => {
 *   const base = count.value * multiplier.value;
 *   return isEven.value ? base : base + 1;
 * });
 *
 * console.log(result.value); // 0 (0 * 2 = 0, isEven = true)
 *
 * count.value = 5;
 * console.log(result.value); // 10 (5 * 2 = 10, isEven = true)
 *
 * isEven.value = false;
 * console.log(result.value); // 11 (5 * 2 = 10, isEven = false, so +1)
 * ```
 */
export function derived<T>(computeFn: () => T, name?: string): State<T> {
  let cachedValue: T;
  let dirty = true;
  let isComputing = false;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  // Create a function to mark this derived value as dirty when dependencies change
  const markDirty = () => {
    dirty = true;
    // Notify subscribers and dependent effects
    subscribers.forEach(sub => {
      if (sub !== markDirty) {
        sub();
      }
    });
    dependencies.forEach(dep => {
      if (dep !== markDirty) {
        dep();
      }
    });
  };

  const computeValue = (): T => {
    if (dirty && !isComputing) {
      isComputing = true;

      // Track dependencies by running the compute function
      const prevEffect = setActiveEffect(markDirty);

      try {
        cachedValue = computeFn();

        // Debug logging
        if (name) {
          const debugConfig = configureDebug();
          logDebug(`derived: '${name}' ${cachedValue}`, debugConfig);
        }
      } finally {
        setActiveEffect(prevEffect);
        isComputing = false;
      }

      dirty = false;
    }

    // Track this derived value as a dependency if we're in an effect
    const activeEffect = setActiveEffect(null);
    if (activeEffect) {
      dependencies.add(activeEffect);
    }

    return cachedValue;
  };

  // Initialize the derived value immediately
  try {
    const prevEffect = setActiveEffect(markDirty);
    try {
      cachedValue = computeFn();
      dirty = false;
    } finally {
      setActiveEffect(prevEffect);
    }
  } catch {
    // If there's an error during initialization, set a default value
    cachedValue = undefined as T;
    dirty = true;
  }

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  // Return a state-like object (read-only)
  const derivedObj = {
    rawValue: cachedValue,
    update: () => {
      throw new Error('Cannot update derived values directly');
    },
    subscribe,
    get value() {
      // Track this derived value as a dependency if we're in an effect
      const activeEffect = setActiveEffect(null);
      if (activeEffect) {
        dependencies.add(activeEffect);
      }
      return computeValue();
    },
    set value(_newValue: T) {
      throw new Error('Cannot update derived values directly');
    },
  } as State<T>;

  // Register named derived values for debugging
  if (name && typeof window !== 'undefined') {
    (window as any).understate.states[name] = derivedObj;
  }

  return derivedObj;
}

/**
 * Creates a read-only signal that automatically updates when dependencies change,
 * supporting async computation functions.
 *
 * @param computeFn - An async function that computes the derived value
 * @param name - Optional name for debugging
 * @returns A state object that holds the computed value
 *
 * @example
 * ```tsx
 * const userId = state(1);
 * const userData = asyncDerived(async () => {
 *   const response = await fetch(`/api/users/${userId.value}`);
 *   return await response.json();
 * }, 'userData');
 *
 * // Access the value (will be a Promise initially)
 * console.log(userData.value); // Promise<User>
 * ```
 */
export function asyncDerived<T>(
  computeFn: () => Promise<T>,
  name?: string,
): State<Promise<T>> {
  let cachedValue: Promise<T>;
  let dirty = true;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  const markDirty = () => {
    if (!dirty) {
      dirty = true;
      subscribers.forEach(sub => sub());
    }
  };

  const computeValue = async (): Promise<T> => {
    if (dirty) {
      dirty = false;

      // Track dependencies by running the compute function
      const prevEffect = setActiveEffect(markDirty);

      try {
        // Debug logging
        if (name) {
          const debugConfig = configureDebug();
          logDebug(`asyncDerived: '${name}' computing`, debugConfig);
        }

        cachedValue = computeFn();
        const result = await cachedValue;

        // Log async resolution
        if (name) {
          const debugConfig = configureDebug();
          logDebug(
            `asyncDerived: '${name}' async resolved: ${result}`,
            debugConfig,
          );
        }

        return result;
      } catch (error) {
        // Log async rejection
        if (name) {
          const debugConfig = configureDebug();
          logDebug(
            `asyncDerived: '${name}' async rejected: ${error}`,
            debugConfig,
          );
        }
        // eslint-disable-next-line no-console
        console.error('AsyncDerived computation failed:', error);
        throw error;
      } finally {
        setActiveEffect(prevEffect);
      }
    }

    return cachedValue;
  };

  // Initialize the derived value immediately
  try {
    const prevEffect = setActiveEffect(markDirty);
    try {
      cachedValue = computeFn();
      dirty = false;

      // Handle async errors during initialization
      cachedValue.catch(error => {
        // Log async rejection during initialization
        if (name) {
          const debugConfig = configureDebug();
          logDebug(
            `asyncDerived: '${name}' async rejected: ${error}`,
            debugConfig,
          );
        }
      });
    } finally {
      setActiveEffect(prevEffect);
    }
  } catch (error) {
    // If there's a sync error during initialization, set a rejected promise
    cachedValue = Promise.reject(error);
    dirty = false;

    // Log sync rejection during initialization
    if (name) {
      const debugConfig = configureDebug();
      logDebug(`asyncDerived: '${name}' async rejected: ${error}`, debugConfig);
    }
  }

  const asyncDerivedObj: State<Promise<T>> = {
    get rawValue() {
      return cachedValue;
    },

    get value() {
      // Track this state as a dependency if we're in an effect or computed
      const activeEffect = setActiveEffect(null);
      if (activeEffect) {
        dependencies.add(activeEffect);
      }

      // Trigger computation if dirty
      if (dirty) {
        computeValue().catch(error => {
          // eslint-disable-next-line no-console
          console.error('AsyncDerived computation failed:', error);
        });
      }

      return cachedValue;
    },

    async update(
      _fn: (prev: Promise<T>) => Promise<T> | Promise<T>,
    ): Promise<void> {
      // For async derived values, we can't really update them directly
      // since they're computed from dependencies. This is a no-op.
      throw new Error(
        'Cannot update async derived values directly - they are computed from dependencies',
      );
    },

    subscribe(callback: () => void) {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    },
  };

  // Register named async derived values for debugging
  if (name && typeof window !== 'undefined') {
    (window as any).understate.states[name] = asyncDerivedObj;
  }

  return asyncDerivedObj;
}
