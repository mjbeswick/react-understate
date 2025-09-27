/**
 * @fileoverview Derived Values
 *
 * This module provides reactive derived values functionality for the signals system.
 * Derived values are read-only signals that automatically update when their dependencies change.
 */

import {
  activeEffect,
  addReadValue,
  configureDebug,
  flushUpdates,
  isBatching,
  pendingUpdates,
  registerDebugItem,
  setActiveEffect,
  type State,
  validateStateName,
} from './core';
import { logDebug } from './debug-utils';

type DerivedSubscriber<T> = (value: T) => void;
type DependentFn = () => void;

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
  const validatedName = name ? validateStateName(name) : undefined;
  const subscribers = new Set<DerivedSubscriber<T>>();
  const dependents = new Set<DependentFn>();
  let hasPendingDependentFlush = false;
  let cachedValue!: T;
  let hasCachedValue = false;
  let dirty = true;
  let computing = false;
  let recomputeRequestedDuringCompute = false;
  let lastError: unknown;

  const runDependents = () => {
    hasPendingDependentFlush = false;
    dependents.forEach(dep => {
      dep();
    });
  };

  const scheduleDependents = () => {
    if (dependents.size === 0) return;
    if (hasPendingDependentFlush) return;
    hasPendingDependentFlush = true;
    pendingUpdates.add(runDependents);
    if (!isBatching && !computing) {
      flushUpdates();
    }
  };

  const markDirty = () => {
    if (computing) {
      recomputeRequestedDuringCompute = true;
    }
    if (!dirty) {
      dirty = true;
      lastError = undefined;
    }
    scheduleDependents();
  };

  const notifySubscribers = (next: T) => {
    subscribers.forEach(callback => {
      callback(next);
    });
  };

  const derivedState: State<T> = {
    get rawValue() {
      return read(false);
    },
    async update(): Promise<void> {
      throw new Error('Cannot update derived values directly');
    },
    subscribe(callback: DerivedSubscriber<T>) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    get value() {
      return read(true);
    },
    set value(_next: T | ((prev: T) => T | Promise<T>)) {
      throw new Error('Cannot update derived values directly');
    },
    get requiredValue() {
      const value = read(true);
      if (value === null || value === undefined) {
        const derivedName = validatedName ? ` '${validatedName}'` : '';
        throw new Error(
          `Required derived value${derivedName} is ${value === null ? 'null' : 'undefined'}. Use .value to access the actual value or ensure the derived value is properly computed.`,
        );
      }
      return value as NonNullable<T>;
    },
    set requiredValue(_next: NonNullable<T>) {
      const derivedName = validatedName ? ` '${validatedName}'` : '';
      throw new Error(
        `Cannot set required value on derived value${derivedName} - they are computed from dependencies`,
      );
    },
  } as State<T>;

  const compute = (): T => {
    if (!dirty && hasCachedValue && lastError === undefined) {
      return cachedValue;
    }
    if (computing) {
      if (lastError !== undefined) {
        throw lastError;
      }
      return cachedValue;
    }

    const previousEffect = setActiveEffect(markDirty);
    computing = true;
    recomputeRequestedDuringCompute = false;

    try {
      const nextValue = computeFn();
      const changed =
        !hasCachedValue ||
        lastError !== undefined ||
        !Object.is(nextValue, cachedValue);

      cachedValue = nextValue;
      hasCachedValue = true;
      dirty = false;
      lastError = undefined;

      if (changed && validatedName) {
        const debugConfig = configureDebug();
        logDebug(
          `derived: '${validatedName}' ${JSON.stringify(nextValue, null, 2)}`,
          debugConfig,
        );
      }

      if (changed) {
        notifySubscribers(nextValue);
      }
      if (previousEffect) {
        dependents.add(previousEffect);
      }

      return nextValue;
    } catch (error) {
      lastError = error;
      dirty = true;
      throw error;
    } finally {
      setActiveEffect(previousEffect);
      computing = false;
      if (recomputeRequestedDuringCompute) {
        dirty = true;
        recomputeRequestedDuringCompute = false;
        scheduleDependents();
      }
      if (hasPendingDependentFlush && !isBatching) {
        flushUpdates();
      }
    }
  };

  const read = (trackDependency: boolean): T => {
    const value = compute();
    if (trackDependency && activeEffect) {
      addReadValue(derivedState);
      dependents.add(activeEffect);
    }
    return value;
  };

  try {
    compute();
  } catch {
    // Defer error handling to the first consumer access
  }

  if (typeof window !== 'undefined') {
    registerDebugItem('derived', validatedName, derivedState);
  }

  return derivedState;
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
  const validatedName = name ? validateStateName(name) : undefined;
  const subscribers = new Set<DerivedSubscriber<Promise<T>>>();
  const dependents = new Set<DependentFn>();
  let hasPendingDependentFlush = false;
  let cachedValue!: Promise<T>;
  let hasCachedValue = false;
  let dirty = true;
  let computing = false;
  let recomputeRequestedDuringCompute = false;

  const runDependents = () => {
    hasPendingDependentFlush = false;
    dependents.forEach(dep => {
      dep();
    });
  };

  const scheduleDependents = () => {
    if (dependents.size === 0) return;
    if (hasPendingDependentFlush) return;
    hasPendingDependentFlush = true;
    pendingUpdates.add(runDependents);
    if (!isBatching && !computing) {
      flushUpdates();
    }
  };

  const markDirty = () => {
    if (computing) {
      recomputeRequestedDuringCompute = true;
    }
    if (!dirty) {
      dirty = true;
    }
    if (validatedName) {
      const debugConfig = configureDebug();
      logDebug(`asyncDerived: '${validatedName}' marked dirty`, debugConfig);
    }
    scheduleDependents();
  };

  const compute = (): Promise<T> => {
    if (!dirty && hasCachedValue) {
      return cachedValue;
    }
    if (computing) {
      return cachedValue;
    }

    const previousEffect = setActiveEffect(markDirty);
    computing = true;
    recomputeRequestedDuringCompute = false;
    dirty = false;

    try {
      if (validatedName) {
        const debugConfig = configureDebug();
        logDebug(`asyncDerived: '${validatedName}' computing`, debugConfig);
      }

      const previousPromise = hasCachedValue ? cachedValue : undefined;
      const nextPromise = computeFn();
      const changed =
        !hasCachedValue || !Object.is(nextPromise, previousPromise);

      cachedValue = nextPromise;
      hasCachedValue = true;

      if (changed) {
        subscribers.forEach(callback => {
          callback(nextPromise);
        });
        scheduleDependents();
      }

      if (previousEffect) {
        dependents.add(previousEffect);
      }

      nextPromise
        .then(result => {
          if (validatedName) {
            const debugConfig = configureDebug();
            logDebug(
              `asyncDerived: '${validatedName}' async resolved: ${JSON.stringify(result, null, 2)}`,
              debugConfig,
            );
          }
          return result;
        })
        .catch(error => {
          if (validatedName) {
            const debugConfig = configureDebug();
            logDebug(
              `asyncDerived: '${validatedName}' async rejected: ${error}`,
              debugConfig,
            );
          }
          // eslint-disable-next-line no-console
          console.error('AsyncDerived computation failed:', error);
          throw error;
        });

      return nextPromise;
    } catch (error) {
      dirty = true;
      throw error;
    } finally {
      setActiveEffect(previousEffect);
      computing = false;
      if (recomputeRequestedDuringCompute) {
        dirty = true;
        recomputeRequestedDuringCompute = false;
      }
      if (hasPendingDependentFlush && !isBatching) {
        flushUpdates();
      }
    }
  };

  const asyncState: State<Promise<T>> = {
    get rawValue() {
      return compute();
    },
    async update(): Promise<void> {
      throw new Error(
        'Cannot update async derived values directly - they are computed from dependencies',
      );
    },
    subscribe(callback: DerivedSubscriber<Promise<T>>) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    get value() {
      const promise = compute();
      if (activeEffect) {
        addReadValue(asyncState);
        dependents.add(activeEffect);
      }
      return promise;
    },
    set value(
      _next: Promise<T> | ((prev: Promise<T>) => Promise<T> | Promise<T>),
    ) {
      throw new Error(
        'Cannot update async derived values directly - they are computed from dependencies',
      );
    },
    get requiredValue(): NonNullable<Promise<T>> {
      if (activeEffect) {
        addReadValue(asyncState);
        dependents.add(activeEffect);
      }
      return compute().then(value => {
        if (value === null || value === undefined) {
          const asyncDerivedName = validatedName ? ` '${validatedName}'` : '';
          throw new Error(
            `Required async derived value${asyncDerivedName} is ${value === null ? 'null' : 'undefined'}. Use .value to access the actual value or ensure the async derived value is properly computed.`,
          );
        }
        return value as NonNullable<T>;
      }) as unknown as NonNullable<Promise<T>>;
    },
    set requiredValue(_next: NonNullable<Promise<T>>) {
      const asyncDerivedName = validatedName ? ` '${validatedName}'` : '';
      throw new Error(
        `Cannot set required value on async derived value${asyncDerivedName} - they are computed from dependencies`,
      );
    },
  } as State<Promise<T>>;

  try {
    compute();
  } catch {
    // Defer error handling to first consumer access
  }

  if (typeof window !== 'undefined') {
    registerDebugItem('derived', validatedName, asyncState);
  }

  return asyncState;
}
