/**
 * @fileoverview Core State Types and Implementation
 *
 * This module contains the core state types and implementation logic.
 * It provides the foundation for the reactive states system.
 */

import { logDebug } from './debug-utils';

// Global state for tracking active effects and batching
let activeEffect: (() => void) | null = null;
let isBatching = false;
const pendingUpdates = new Set<() => void>();

// Debug configuration
type DebugOptions = {
  enabled?: boolean;
  logger?: (message: string, ...args: any[]) => void;
  showFile?: boolean;
};

let debugConfig: DebugOptions = {
  enabled: false,
  // eslint-disable-next-line no-console
  logger: (...args: any[]) => console.log(...args),
};

/**
 * TypeScript utility type for deep immutability.
 * Makes all properties and nested properties readonly at compile time.
 * This provides compile-time safety without runtime overhead.
 */
export type DeepReadonly<T> = T extends (infer R)[]
  ? ReadonlyArray<DeepReadonly<R>>
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/**
 * A reactive state that holds a value and notifies subscribers when it changes.
 *
 * States are the core building blocks of the reactive system. They can hold any
 * type of value and automatically track dependencies when used in effects or
 * computed values.
 *
 * **Key Principles:**
 * - Always use `.value` to read/write state values
 * - Never assign the state object to a variable for storage
 * - States are designed to be passed around and used directly
 *
 * @template T - The type of value held by the state
 *
 * @example
 * ```tsx
 * import { state } from './core';
 *
 * // Create states
 * const count = state(0);
 * const name = state('John');
 * const user = state({ id: 1, name: 'John' });
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
 * // ❌ INCORRECT: Don't assign states to variables
 * // const badCount = count; // This breaks reactivity!
 * // const badValue = count.value; // This doesn't track changes!
 * ```
 */
export interface State<T> {
  /**
   * The raw internal value of the state.
   *
   * Use `.value` for reactive access that tracks dependencies.
   * Use `.rawValue` only when you need the current value without
   * establishing a dependency (e.g., in cleanup functions).
   */
  readonly rawValue: T;

  /**
   * Updates the state using a function that receives the previous value.
   *
   * This method is useful for complex updates that depend on the current value
   * or for async updates.
   *
   * @param fn - Function that receives the previous value and returns the new value
   * @returns Promise that resolves when the update is complete
   *
   * @example
   * ```tsx
   * const count = state(0);
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
   * Subscribes to changes in the state value.
   *
   * @param fn - Function to call when the state value changes
   * @returns Unsubscribe function to remove the subscription
   *
   * @example
   * ```tsx
   * const count = state(0);
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
   * The current value of the state.
   *
   * **Getter:** Returns the current value and tracks this state as a dependency
   * **Setter:** Updates the state value and notifies all subscribers.
   * Can accept a direct value or a function (sync or async) that receives the previous value.
   *
   * @example
   * ```tsx
   * const count = state(0);
   *
   * // Reading (establishes dependency)
   * console.log(count.value); // 0
   *
   * // Writing (triggers updates)
   * count.value = 42;
   *
   * // Using function (sync)
   * count.value = prev => prev + 1;
   *
   * // Using async function
   * count.value = async (prev) => {
   *   const result = await fetch('/api/increment');
   *   return prev + await result.json();
   * };
   *
   * // In computed or effects, this automatically tracks dependencies
   * const double = computed(() => count.value * 2);
   * effect(() => console.log(`Count is now: ${count.value}`));
   * ```
   */
  value: T;
}

/**
 * Configures debug logging for the reactive system.
 *
 * When called with no arguments, returns the current debug configuration.
 * When called with options, updates the debug configuration.
 *
 * @param options - Optional debug configuration options
 * @returns Current debug configuration
 *
 * @example
 * ```tsx
 * import { configureDebug } from 'react-understate';
 *
 * // Get current configuration
 * const config = configureDebug();
 * console.log('Debug enabled:', config.enabled);
 *
 * // Enable debug logging
 * configureDebug({ enabled: true });
 *
 * // Custom logger
 * configureDebug({
 *   enabled: true,
 *   logger: (msg, ...args) => console.info(`[DEBUG] ${msg}`, ...args)
 * });
 *
 * // Disable debug logging
 * configureDebug({ enabled: false });
 * ```
 */
export function configureDebug(options?: DebugOptions): Readonly<DebugOptions> {
  if (options !== undefined) {
    debugConfig = { ...debugConfig, ...options };
  }
  return { ...debugConfig };
}

/**
 * Creates an action function that automatically batches updates and logs execution.
 *
 * Actions are useful for grouping related state updates and provide better debugging
 * when debug logging is enabled.
 *
 * @param fn - The action function to execute
 * @param name - Optional name for debugging purposes
 * @returns The action function
 *
 * @example
 * ```tsx
 * import { action, state } from 'react-understate';
 *
 * const todos = state<Todo[]>([], 'todos');
 * const filter = state<'all' | 'active' | 'completed'>('all', 'filter');
 *
 * const addTodo = action((text: string) => {
 *   todos.value = [...todos.value, { id: Date.now(), text, completed: false }];
 *   filter.value = 'all';
 * }, 'addTodo');
 *
 * const toggleTodo = action((id: number) => {
 *   todos.value = todos.value.map(todo =>
 *     todo.id === id ? { ...todo, completed: !todo.completed } : todo
 *   );
 * }, 'toggleTodo');
 *
 * // Usage
 * addTodo('Learn React');
 * toggleTodo(1);
 * ```
 */
export function action<T extends (...args: any[]) => any>(
  fn: T,
  name?: string,
): T {
  return ((...args: Parameters<T>) => {
    // Debug logging
    if (name) {
      logDebug(`action: '${name}'`, debugConfig);
    }

    // Automatically batch the action
    let result: ReturnType<T>;
    batch(() => {
      result = fn(...args);
    });
    return result!;
  }) as T;
}

/**
 * Creates a reactive state with an initial value.
 *
 * This is the primary function for creating reactive state. States
 * automatically track dependencies and notify subscribers when their
 * values change.
 *
 * **Best Practices:**
 * - Create states at the top level of your module or component
 * - Pass state objects around, not their values
 * - Always use `.value` to read/write state values
 * - Don't assign states to variables for storage
 *
 * @param initialValue - The initial value for the state
 * @param name - Optional name for debugging purposes
 * @returns A reactive state that can be read and written using the .value property
 *
 * @example
 * ```tsx
 * import { state, effect } from './core';
 *
 * // Create states for different types
 * const count = state(0);
 * const name = state('John');
 * const isActive = state(false);
 * const user = state({ id: 1, name: 'John', email: 'john@example.com' });
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
 * // ❌ INCORRECT: Don't assign states to variables
 * // const badCount = count; // This breaks reactivity!
 * // const badValue = count.value; // This doesn't track changes!
 * ```
 *
 * @example
 * ```tsx
 * // State composition
 * const firstName = state('John');
 * const lastName = state('Doe');
 *
 * // Computed state that depends on multiple states
 * const fullName = computed(() => `${firstName.value} ${lastName.value}`);
 *
 * // Effect that reacts to full name changes
 * effect(() => {
 *   document.title = `Hello, ${fullName.value}!`;
 * });
 *
 * // Update one state - automatically updates computed and effect
 * firstName.value = 'Jane';
 * // Document title automatically changes to "Hello, Jane Doe!"
 * ```
 */
export function state<T>(initialValue: T, name?: string): State<T> {
  // Store the initial value directly - TypeScript handles immutability
  let value = initialValue;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  const notify = () => {
    // Notify all subscribers
    subscribers.forEach(sub => {
      if (sub !== activeEffect) {
        sub();
      }
    });

    // Also notify dependencies (effects and computed values)
    dependencies.forEach(dep => {
      dep();
    });
  };

  const setValue = async (
    newValue: T | ((prev: T) => T | Promise<T>),
  ): Promise<void> => {
    try {
      let resolvedValue: T;

      if (typeof newValue === 'function') {
        // Handle function (sync or async)
        const result = (newValue as (prev: T) => T | Promise<T>)(value);
        if (result instanceof Promise) {
          try {
            resolvedValue = await result;
            // Log async resolution
            if (name) {
              logDebug(
                `state: '${name}' async resolved: ${resolvedValue}`,
                debugConfig,
              );
            }
          } catch (error) {
            // Log async rejection
            if (name) {
              logDebug(
                `state: '${name}' async rejected: ${error}`,
                debugConfig,
              );
            }
            throw error;
          }
        } else {
          resolvedValue = result;
        }
      } else {
        // Handle direct value
        resolvedValue = newValue;
      }

      if (!Object.is(value, resolvedValue)) {
        // Debug logging
        if (name) {
          logDebug(`state: '${name}' ${resolvedValue}`, debugConfig);
        }

        // Store the new value directly - TypeScript handles immutability
        value = resolvedValue;
        // Schedule updates
        pendingUpdates.add(notify);
        if (!isBatching) {
          flushUpdates();
        }
      }
    } catch {
      // Ignore failed updates silently
      // State update failed - this is expected in some edge cases
    }
  };

  const update = async (fn: (prev: T) => T | Promise<T>): Promise<void> => {
    try {
      const result = fn(value); // value is the previous value
      if (result instanceof Promise) {
        try {
          const newValue = await result;
          // Log async resolution
          if (name) {
            logDebug(
              `state: '${name}' update async resolved: ${newValue}`,
              debugConfig,
            );
          }
          // Update the state with the resolved value
          setValue(newValue);
        } catch (error) {
          // Log async rejection
          if (name) {
            logDebug(
              `state: '${name}' update async rejected: ${error}`,
              debugConfig,
            );
          }
          throw error;
        }
      } else {
        // Update the state with the sync value
        setValue(result);
      }
    } catch {
      // Ignore failed updates silently
      // State update failed - this is expected in some edge cases
    }
  };

  const subscribe = (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  };

  // Create the state object
  const stateObj = {
    get rawValue() {
      return value;
    },
    update,
    subscribe,
    get value() {
      // Track this state as a dependency if we're in an effect or computed
      if (activeEffect) {
        dependencies.add(activeEffect);
      }
      return value;
    },
    set value(newValue: T | ((prev: T) => T | Promise<T>)) {
      setValue(newValue);
    },

    toString() {
      return String(value);
    },
  };

  // Register named states for debugging
  if (name && typeof window !== 'undefined') {
    (window as any).understate.states[name] = stateObj;
  }

  return stateObj as State<T>;
}

/**
 * Flushes all pending updates.
 *
 * This function processes all queued state updates and triggers their
 * associated effects. It's called automatically by the batching system
 * and typically doesn't need to be called manually.
 *
 * @internal
 */
export function flushUpdates(): void {
  if (pendingUpdates.size === 0) return;

  const updates = Array.from(pendingUpdates);
  pendingUpdates.clear();

  updates.forEach(update => update());
}

// Export internal functions for use by other modules
export { activeEffect, isBatching, pendingUpdates };
export function setActiveEffect(
  effect: (() => void) | null,
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

/**
 * Batches multiple signal updates into a single effect flush.
 *
 * Batching allows you to perform multiple signal updates without triggering
 * effects after each individual update. Instead, all effects are batched
 * together and run once at the end, improving performance and preventing
 * unnecessary intermediate updates.
 *
 * @param fn - A function that performs multiple signal updates
 *
 * @example
 * ```tsx
 * import { state, effect, batch } from './core';
 *
 * const firstName = state('John');
 * const lastName = state('Doe');
 * const age = state(30);
 *
 * // Effect that depends on multiple signals
 * effect(() => {
 *   console.log(`Hello ${firstName.value} ${lastName.value}, age ${age.value}`);
 * });
 *
 * // Without batching - effect runs 3 times
 * firstName.value = 'Jane';
 * lastName.value = 'Smith';
 * age.value = 25;
 *
 * // With batching - effect runs only once
 * batch(() => {
 *   firstName.value = 'Bob';
 *   lastName.value = 'Johnson';
 *   age.value = 35;
 * });
 * ```
 */
export function batch(fn: () => void): void {
  if (setIsBatching(false)) {
    fn();
    return;
  }

  setIsBatching(true);
  try {
    fn();
  } finally {
    setIsBatching(false);
    flushUpdates();
  }
}

// Expose debug API and states on window for browser debugging
if (typeof window !== 'undefined') {
  (window as any).understate = {
    configureDebug,
    states: {},
  };
}
