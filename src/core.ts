/**
 * @fileoverview Core Signal Types and Implementation
 *
 * This module contains the core signal types and implementation logic.
 * It provides the foundation for the reactive signals system.
 */

// Global state for tracking active effects and batching
let activeEffect: (() => void) | null = null;
let isBatching = false;
const pendingUpdates = new Set<() => void>();

/**
 * A reactive signal that holds a value and notifies subscribers when it changes.
 *
 * Signals are the core building blocks of the reactive system. They can hold any
 * type of value and automatically track dependencies when used in effects or
 * computed values.
 *
 * **Key Principles:**
 * - Always use `.value` to read/write signal values
 * - Never assign the signal object to a variable for storage
 * - Signals are designed to be passed around and used directly
 *
 * @template T - The type of value held by the signal
 *
 * @example
 * ```tsx
 * import { signal } from './core';
 *
 * // Create signals
 * const count = signal(0);
 * const name = signal('John');
 * const user = signal({ id: 1, name: 'John' });
 *
 * // ✅ CORRECT: Read and write using .value
 * console.log(count.value); // 0
 * count.value = 42;
 * console.log(count.value); // 42
 *
 * // ✅ CORRECT: Use in computed values
 * const doubleCount = computed(() => count.value * 2);
 *
 * // ✅ CORRECT: Use in effects
 * effect(() => {
 *   console.log(`Count changed to: ${count.value}`);
 * });
 *
 * // ❌ INCORRECT: Don't assign signals to variables
 * // const badCount = count; // This breaks reactivity!
 * // const badValue = count.value; // This doesn't track changes!
 * ```
 */
export type Signal<T> = {
  /**
   * The raw internal value of the signal.
   *
   * Use `.value` for reactive access that tracks dependencies.
   * Use `.rawValue` only when you need the current value without
   * establishing a dependency (e.g., in cleanup functions).
   */
  rawValue: T;

  /**
   * Updates the signal using a function that receives the previous value.
   *
   * This method is useful for complex updates that depend on the current value
   * or for async updates.
   *
   * @param fn - Function that receives the previous value and returns the new value
   * @returns Promise that resolves when the update is complete
   *
   * @example
   * ```tsx
   * const count = signal(0);
   *
   * // Sync update
   * await count.update(prev => prev + 1);
   *
   * // Async update
   * await count.update(async (prev) => {
   *   const result = await fetch('/api/increment', {
   *     body: JSON.stringify({ current: prev })
   *   });
   *   return result.json();
   * });
   * ```
   */
  update(fn: (prev: T) => T | Promise<T>): Promise<void>;

  /**
   * Subscribes to changes in the signal value.
   *
   * @param fn - Function to call when the signal value changes
   * @returns Unsubscribe function to remove the subscription
   *
   * @example
   * ```tsx
   * const count = signal(0);
   *
   * const unsubscribe = count.subscribe(() => {
   *   console.log('Count changed!');
   * });
   *
   * count.value = 5; // Logs: "Count changed!"
   *
   * // Clean up subscription
   * unsubscribe();
   * ```
   */
  subscribe(fn: () => void): () => void;

  /**
   * Whether the signal is currently being updated.
   *
   * Useful for showing loading states during async updates.
   */
  readonly pending: boolean;

  /**
   * The current value of the signal.
   *
   * **Getter:** Returns the current value and tracks this signal as a dependency
   * **Setter:** Updates the signal value and notifies all subscribers
   *
   * @example
   * ```tsx
   * const count = signal(0);
   *
   * // Reading (establishes dependency)
   * console.log(count.value); // 0
   *
   * // Writing (triggers updates)
   * count.value = 42;
   *
   * // In computed or effects, this automatically tracks dependencies
   * const double = computed(() => count.value * 2);
   * effect(() => console.log(`Count is now: ${count.value}`));
   * ```
   */
  value: T;
};

/**
 * A read-only signal that can only be read and subscribed to, not modified.
 *
 * Read-only signals are useful for computed values and other derived state
 * that should not be directly modified by consumers. They provide the same
 * reactive behavior as regular signals but without the ability to modify
 * the underlying value.
 *
 * @template T - The type of value held by the signal
 *
 * @example
 * ```tsx
 * import { signal, computed } from './effects';
 *
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * // Create a computed (read-only) signal
 * const fullName = computed(() => `${firstName.value} ${lastName.value}`);
 *
 * // ✅ CORRECT: Read the computed value
 * console.log(fullName.value); // "John Doe"
 *
 * // ❌ INCORRECT: Cannot modify computed values
 * // fullName.value = 'Jane Smith'; // Error!
 *
 * // The computed automatically updates when dependencies change
 * firstName.value = 'Jane';
 * console.log(fullName.value); // "Jane Doe"
 * ```
 */
export type ReadonlyState<T> = {
  /**
   * The raw internal value of the signal.
   *
   * Use `.value` for reactive access that tracks dependencies.
   * Use `.rawValue` only when you need the current value without
   * establishing a dependency.
   */
  rawValue: T;

  /**
   * Subscribes to changes in the signal value.
   *
   * @param fn - Function to call when the signal value changes
   * @returns Unsubscribe function to remove the subscription
   */
  subscribe(fn: () => void): () => void;

  /**
   * Whether the signal is currently being updated.
   *
   * For computed values, this is always false since they cannot be
   * directly updated.
   */
  readonly pending: boolean;

  /**
   * The current value of the signal (read-only).
   *
   * Reading this property establishes a dependency on the signal,
   * causing any containing effects or computed values to re-run
   * when the signal changes.
   */
  readonly value: T;
};

/**
 * Creates a reactive signal with an initial value.
 *
 * This is the primary function for creating reactive state. Signals
 * automatically track dependencies and notify subscribers when their
 * values change.
 *
 * **Best Practices:**
 * - Create signals at the top level of your module or component
 * - Pass signal objects around, not their values
 * - Always use `.value` to read/write signal values
 * - Don't assign signals to variables for storage
 *
 * @param initialValue - The initial value for the signal
 * @returns A reactive signal that can be read and written using the .value property
 *
 * @example
 * ```tsx
 * import { signal, effect } from './core';
 *
 * // Create signals for different types
 * const count = signal(0);
 * const name = signal('John');
 * const isActive = signal(false);
 * const user = signal({ id: 1, name: 'John', email: 'john@example.com' });
 *
 * // ✅ CORRECT: Use .value to read and write
 * console.log(count.value); // 0
 * count.value = 42;
 * console.log(count.value); // 42
 *
 * // ✅ CORRECT: Use in effects for automatic tracking
 * effect(() => {
 *   console.log(`Count is now: ${count.value}`);
 *   console.log(`User is: ${user.value.name}`);
 * });
 *
 * // ✅ CORRECT: Update object properties
 * user.value = { ...user.value, name: 'Jane' };
 *
 * // ✅ CORRECT: Use in computed values
 * const doubleCount = computed(() => count.value * 2);
 *
 * // ❌ INCORRECT: Don't assign signals to variables
 * // const badCount = count; // This breaks reactivity!
 * // const badValue = count.value; // This doesn't track changes!
 * ```
 *
 * @example
 * ```tsx
 * // Signal composition
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 *
 * // Computed signal that depends on multiple signals
 * const fullName = computed(() => `${firstName.value} ${lastName.value}`);
 *
 * // Effect that reacts to full name changes
 * effect(() => {
 *   document.title = `Hello, ${fullName.value}!`;
 * });
 *
 * // Update one signal - automatically updates computed and effect
 * firstName.value = 'Jane';
 * // Document title automatically changes to "Hello, Jane Doe!"
 * ```
 */
export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  let pending = false;
  let pendingUpdateCount = 0;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  const notify = () => {
    // Notify all subscribers
    subscribers.forEach((sub) => {
      if (sub !== activeEffect) {
        sub();
      }
    });

    // Also notify dependencies (effects and computed values)
    dependencies.forEach((dep) => {
      dep();
    });
  };

  const setValue = (newValue: T): void => {
    if (!Object.is(value, newValue)) {
      value = newValue;
      // Schedule updates
      pendingUpdates.add(notify);
      if (!isBatching) {
        flushUpdates();
      }
    }
  };

  const update = async (fn: (prev: T) => T | Promise<T>): Promise<void> => {
    try {
      pendingUpdateCount++;
      const wasPending = pending;
      pending = true;

      // Notify subscribers when pending state changes from false to true
      if (!wasPending && pending) {
        notify();
      }

      const result = fn(value); // value is the previous value
      if (result instanceof Promise) {
        const newValue = await result;
        // Update the signal with the resolved value
        setValue(newValue);
      } else {
        // Update the signal with the sync value
        setValue(result);
      }
    } catch (error) {
      // Ignore failed updates, just log them
      console.warn('Signal update failed:', error);
    } finally {
      const wasPending = pending;
      pendingUpdateCount--;
      if (pendingUpdateCount === 0) {
        pending = false;
        // Notify subscribers when pending state changes from true to false
        if (wasPending && !pending) {
          notify();
        }
      }
    }
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  // Create the signal object with proper pending property access
  const signalObj = {
    get rawValue() {
      return value;
    },
    update,
    subscribe,
    get pending() {
      // Track this signal as a dependency if we're in an effect or computed
      if (activeEffect) {
        dependencies.add(activeEffect);
      }
      return pending;
    },
    get value() {
      // Track this signal as a dependency if we're in an effect or computed
      if (activeEffect) {
        dependencies.add(activeEffect);
      }
      return value;
    },
    set value(newValue: T) {
      setValue(newValue);
    },
    toString() {
      return String(value);
    },
  };

  return signalObj as Signal<T>;
}

/**
 * Flushes all pending updates.
 *
 * This function processes all queued signal updates and triggers their
 * associated effects. It's called automatically by the batching system
 * and typically doesn't need to be called manually.
 *
 * @internal
 */
export function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const updates = Array.from(pendingUpdates);
  pendingUpdates.clear();

  updates.forEach((update) => update());
}

// Export internal functions for use by other modules
export { activeEffect, isBatching, pendingUpdates };
export function setActiveEffect(
  effect: (() => void) | null
): (() => void) | null {
  const prev = activeEffect;
  activeEffect = effect;
  return prev;
}
export function setIsBatching(batching: boolean): boolean {
  const prev = isBatching;
  isBatching = batching;
  return prev;
}
