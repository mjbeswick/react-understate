/**
 * @fileoverview Core State Types and Implementation
 *
 * This module contains the core state types and implementation logic.
 * It provides the foundation for the reactive states system.
 */

import { logDebug } from './debug-utils';

/**
 * A valid state name that cannot contain dots (.) as they break the code.
 * State names are used for debugging and must be valid JavaScript identifiers.
 */
export type StateName = string & { readonly __brand: 'StateName' };

/**
 * Validates that a name is valid for use as a state name.
 * Names cannot contain dots (.) as they break the code.
 *
 * @param name - The name to validate
 * @returns The validated name as a StateName type
 * @throws Error if the name is invalid
 */
export function validateStateName(name: string): StateName {
  if (typeof name !== 'string') {
    throw new Error(
      `Invalid state name: expected a string, received ${Object.prototype.toString.call(name)}`,
    );
  }
  if (name.includes('.')) {
    throw new Error(
      `Invalid state name '${name}': Names cannot contain dots (.) as they break the code.`,
    );
  }

  // Additional validation for valid JavaScript identifier
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    throw new Error(
      `Invalid state name '${name}': Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).`,
    );
  }

  return name as StateName;
}

// Global state for tracking active effects and batching
let activeEffect: (() => void) | null = null;
let isBatching = false;
const pendingUpdates = new Set<() => void>();



// Global state for tracking running actions and their queues
const runningActions = new Map<string, Promise<any>>();
const actionQueues = new Map<string, Array<() => void>>();
const runningActionControllers = new Map<string, AbortController>();
let isInAction = false;

// Global state for tracking effect dependency filtering
let activeEffectOptions: {
  once?: boolean;
  preventOverlap?: boolean;
  preventLoops?: boolean;
} | null = null;

// Track which reactive values were read by the current effect
const readValues = new Set<{ value: any }>();
let currentEffect: (() => void) | null = null;
const effectModifiedValues = new WeakMap<() => void, Set<{ value: any }>>();
const effectReadValues = new WeakMap<() => void, Set<{ value: any }>>();
const effectOptions = new WeakMap<
  () => void,
  { once?: boolean; preventOverlap?: boolean; preventLoops?: boolean }
>();

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

// --- DevTools bridge helpers ---
type DevtoolsBridge = { publish: (event: any) => void } | undefined;
function getDevtoolsBridge(): DevtoolsBridge {
  try {
    // Accessing window may throw in some environments
    if (typeof window !== 'undefined') {
      return (window as any).__UNDERSTATE_DEVTOOLS__;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function publishDevtoolsEvent(type: string, payload: any): void {
  const bridge = getDevtoolsBridge();
  if (!bridge || typeof bridge.publish !== 'function') return;
  try {
    bridge.publish({ type, payload, ts: Date.now() });
  } catch {
    void 0;
  }
}

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
  get value(): T;
  set value(newValue: T | ((prev: T) => T | Promise<T>));

  /**
   * Required value property with runtime null/undefined checking.
   *
   * This property provides a non-null assertion that returns the value
   * or throws an error if the value is null or undefined. The setter
   * also prevents setting null or undefined values.
   *
   * @throws {Error} If the value is null or undefined (getter) or if trying to set null/undefined (setter)
   *
   * @example
   * ```tsx
   * const user = state<User | null>(null);
   *
   * // After ensuring user is loaded
   * if (user.value) {
   *   // TypeScript knows user.value is User | null
   *   console.log(user.value.name); // Type error: name might not exist
   *
   *   // Use non-null assertion when you know it's safe
   *   console.log(user.value!.name); // Works, but no runtime safety
   *
   *   // Or use the requiredValue property for runtime safety
   *   console.log(user.requiredValue.name); // Works with runtime check
   * }
   *
   * // Setter also prevents null/undefined values
   * user.requiredValue = { id: 1, name: 'John' }; // Works
   * user.requiredValue = null; // Throws error
   * ```
   */
  get requiredValue(): NonNullable<T>;
  set requiredValue(newValue: NonNullable<T>);
}

export type StateOptions = {
  name?: string;
  observeMutations?: boolean;
};

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
export type ActionConcurrency = 'queue' | 'drop';

export type ActionOptions = {
  concurrency?: ActionConcurrency;
};

export class ConcurrentActionError extends Error {
  constructor(actionName?: string) {
    super(
      actionName
        ? `Concurrent call dropped for action '${actionName}'`
        : 'Concurrent action call dropped',
    );
    this.name = 'ConcurrentActionError';
  }
}

/**
 * Error thrown when a concurrent action call is dropped due to concurrency policy.
 *
 * @remarks
 * This error is thrown by actions created with `concurrency: 'drop'` when a previous invocation is still running.
 *
 * @example
 * ```ts
 * const myAction = action(async () => { /* ... *\/ }, 'myAction', { concurrency: 'drop' });
 * try {
 *   myAction();
 *   myAction(); // Throws ConcurrentActionError
 * } catch (e) {
 *   if (e instanceof ConcurrentActionError) {
 *     // Handle dropped call
 *   }
 * }
 * ```
 */
export function action<T extends (...args: any[]) => any>(
  fn: T,
  nameOrOptions?: string | (ActionOptions & { name?: string }),
  options?: ActionOptions,
): T {
  // Normalize name and options (support passing options as second arg)
  const incomingName =
    typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions?.name;
  const validatedName = incomingName
    ? validateStateName(incomingName)
    : undefined;

  // Register named actions for debugging (only once when action is created)
  if (validatedName && typeof window !== 'undefined') {
    // Initialize window.reactUnderstate if not already done
    const windowUnderstate = getWindowUnderstate();
    if (windowUnderstate.actions[validatedName]) {
      throw new Error(
        `Action with name '${validatedName}' already exists. Action names must be unique.`,
      );
    }
    // Store the action function for console debugging
    windowUnderstate.actions[validatedName] = fn;
  }

  const normalizedOptions: ActionOptions =
    typeof nameOrOptions === 'object' && nameOrOptions
      ? { concurrency: nameOrOptions.concurrency }
      : (options ?? {});

  const resolvedOptions: Required<ActionOptions> = {
    concurrency: 'queue',
    ...(normalizedOptions ?? {}),
  } as Required<ActionOptions>;

  return ((...args: Parameters<T>) => {
    // Debug logging
    if (validatedName) {
      logDebug(`action: '${validatedName}'`, debugConfig);
      publishDevtoolsEvent('action:call', {
        name: validatedName,
        argsLength: args.length,
      });
    }

    // Create abort controller for async functions
    const abortController = new AbortController();
    const system = { signal: abortController.signal };

    // Handle async queuing for named actions
    if (validatedName) {
      const isCurrentlyRunning = runningActions.has(validatedName);

      if (isCurrentlyRunning) {
        if (resolvedOptions.concurrency === 'drop') {
          // Abort current and allow new call to proceed
          const controller = runningActionControllers.get(validatedName);
          if (controller) {
            try {
              controller.abort();
            } catch {
              // ignore
            }
          }
          // fall through and execute new call
        } else {
          // Default: queue
          if (!actionQueues.has(validatedName)) {
            actionQueues.set(validatedName, []);
          }

          return new Promise<ReturnType<T>>((resolve, reject) => {
            const queuedExecution = () => {
              try {
                // Create a new system object for the queued execution
                const innerAbortController = new AbortController();
                const innerSystem = { signal: innerAbortController.signal };
                runningActionControllers.set(
                  validatedName,
                  innerAbortController,
                );

                // Prepare args with system object
                const preparedArgs = [...args];
                if (fn.length > 0) {
                  const lastArg = preparedArgs[preparedArgs.length - 1];
                  if (
                    typeof lastArg === 'object' &&
                    lastArg !== null &&
                    'signal' in lastArg
                  ) {
                    preparedArgs[preparedArgs.length - 1] = innerSystem;
                  } else {
                    preparedArgs.push(innerSystem as any);
                  }
                }

                // Call the function directly instead of creating a new action
                isInAction = true;
                const result = fn(...preparedArgs);
                if (result instanceof Promise) {
                  const promiseResult = result;
                  runningActions.set(validatedName, promiseResult);
                  promiseResult
                    .then(resolve)
                    .catch(reject)
                    .finally(() => {
                      isInAction = false;
                      runningActions.delete(validatedName);
                      runningActionControllers.delete(validatedName);
                      const queue = actionQueues.get(validatedName);
                      if (queue && queue.length > 0) {
                        const nextExecution = queue.shift()!;
                        setTimeout(() => nextExecution(), 0);
                      }
                    });
                } else {
                  resolve(result);
                  isInAction = false;
                  // Schedule next queued execution
                  const queue = actionQueues.get(validatedName);
                  if (queue && queue.length > 0) {
                    const nextExecution = queue.shift()!;
                    setTimeout(() => nextExecution(), 0);
                  }
                }
              } catch (error) {
                const reason =
                  error instanceof Error ? error : new Error(String(error));
                reject(reason);
              }
            };
            actionQueues.get(validatedName)!.push(queuedExecution);
          });
        }
      }
    }

    // Automatically batch the action
    let result: ReturnType<T> = undefined as any;
    isInAction = true;
    try {
      if (validatedName) {
        runningActionControllers.set(validatedName, abortController);
      }
      
      // Preserve current effect context when action is called from within an effect
      const preservedCurrentEffect = currentEffect;
      
      batch(() => {
        // Restore current effect context inside the batch
        setCurrentEffect(preservedCurrentEffect);
        
        // Pass system object with signal to async functions
        if (fn.length > 0) {
          // Check if the function expects a system parameter
          const lastArg = args[args.length - 1];
          if (
            typeof lastArg === 'object' &&
            lastArg !== null &&
            'signal' in lastArg
          ) {
            // Replace the existing system object
            args[args.length - 1] = system;
          } else {
            // Add system object as last parameter
            args.push(system as any);
          }
        }
        result = fn(...args);
      });
    } finally {
      isInAction = false;
    }

    // Handle async result for named actions
    if (
      validatedName &&
      result &&
      typeof result === 'object' &&
      'then' in result
    ) {
      const promiseResult = result as Promise<any>;
      runningActions.set(validatedName, promiseResult);

      promiseResult.finally(() => {
        publishDevtoolsEvent('action:settled', { name: validatedName });
        runningActions.delete(validatedName);
        runningActionControllers.delete(validatedName);
        const queue = actionQueues.get(validatedName);
        if (queue && queue.length > 0) {
          const nextExecution = queue.shift()!;
          // Process next execution asynchronously to avoid stack overflow
          setTimeout(() => nextExecution(), 0);
        }
      });
    }

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
// Overloads to provide readonly typing when observeMutations is not enabled
export function state<T>(
  initialValue: T,
  name?: string,
): State<DeepReadonly<T>>;
export function state<T>(
  initialValue: T,
  options: { name?: string; observeMutations?: false },
): State<DeepReadonly<T>>;
export function state<T>(
  initialValue: T,
  options: { name?: string; observeMutations: true },
): State<T>;
export function state<T>(
  initialValue: T,
  optionsOrName?: StateOptions | string,
): State<any> {
  // Support both name string and options object
  const options: StateOptions | undefined =
    typeof optionsOrName === 'string' ? { name: optionsOrName } : optionsOrName;
  const validatedName = options?.name
    ? validateStateName(options.name)
    : undefined;
  // Store the initial value directly - TypeScript handles immutability
  let value = initialValue as any as T;
  const subscribers = new Set<() => void>();
  const dependencies = new Set<() => void>();

  // Cache for proxied access when observeMutations is enabled
  let arrayProxy: any | null = null;
  let objectProxy: any | null = null;

  const notify = () => {
    // Notify all subscribers
    subscribers.forEach(sub => {
      if (sub !== activeEffect) {
        sub();
      }
    });

    // Also notify dependencies (effects and computed values)
    dependencies.forEach(dep => {
      // Skip notifying the effect that is currently executing (loop prevention)
      if (
        activeEffectOptions?.preventLoops !== false &&
        wasValueRead(stateObj) &&
        (dep === activeEffect || dep === currentEffect)
      ) {
        return;
      }
      // Skip notifying effects that modified this value in their last run
      // Only skip if loop prevention is enabled for this specific effect
      const depOptions = getEffectOptions(dep as any);
      if (
        depOptions?.preventLoops !== false &&
        wasValueModifiedByEffect(dep as any, stateObj)
      ) {
        return;
      }
      
      dep();
    });
  };

  const setValue = async (
    newValue: T | ((prev: T) => T | Promise<T>),
  ): Promise<void> => {
    try {
      let resolvedValue: T;
      const debugConfig = configureDebug();

      if (typeof newValue === 'function') {
        // Handle function (sync or async)
        const result = (newValue as (prev: T) => T | Promise<T>)(value);
        if (result instanceof Promise) {
          try {
            resolvedValue = await result;
            // Log async resolution
            if (validatedName) {
              logDebug(
                `state: '${validatedName}' async resolved: ${JSON.stringify(resolvedValue, null, 2)}`,
                debugConfig,
              );
            }
          } catch (error) {
            // Log async rejection
            if (validatedName) {
              logDebug(
                `state: '${validatedName}' async rejected: ${error}`,
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
        if (validatedName) {
          logDebug(
            `state: '${validatedName}' ${JSON.stringify(resolvedValue, null, 2)}`,
            debugConfig,
          );
          publishDevtoolsEvent('state:update', {
            name: validatedName,
            value: resolvedValue,
          });
        }

        // Store the new value directly - TypeScript handles immutability
        value = resolvedValue;
        // Track that the current effect modified this value (if inside an effect)
        registerEffectModification(stateObj);
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
          if (validatedName) {
            const debugConfig = configureDebug();
            logDebug(
              `state: '${validatedName}' update async resolved: ${JSON.stringify(newValue, null, 2)}`,
              debugConfig,
            );
          }
          // Update the state with the resolved value
          setValue(newValue);
        } catch (error) {
          // Log async rejection
          if (validatedName) {
            const debugConfig = configureDebug();
            logDebug(
              `state: '${validatedName}' update async rejected: ${error}`,
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
        // Track that this value was read during effect execution
        addReadValue(stateObj);
        dependencies.add(activeEffect);
      }
      // Shallow mutation observation via Proxy (arrays and plain objects)
      if (options?.observeMutations) {
        // Arrays
        if (Array.isArray(value)) {
          if (arrayProxy) return arrayProxy;
          const mutatingMethods = new Set([
            'push',
            'pop',
            'shift',
            'unshift',
            'splice',
            'sort',
            'reverse',
            'fill',
            'copyWithin',
          ]);
          arrayProxy = new Proxy(value, {
            get(_target, prop, receiver) {
              if (typeof prop === 'string' && mutatingMethods.has(prop)) {
                return (...args: unknown[]) => {
                  const current = value as unknown as unknown[];
                  const cloned = current.slice();
                  const result = (cloned as any)[prop](...args);
                  stateObj.value = cloned as unknown as T;
                  return result;
                };
              }
              // Non-mutating reads forward to current value
              const current = value as any;
              const out = Reflect.get(current, prop, receiver);
              return typeof out === 'function' ? out.bind(current) : out;
            },
          });
          return arrayProxy as unknown as T;
        }
        // Plain objects (shallow)
        if (
          value !== null &&
          typeof value === 'object' &&
          Object.getPrototypeOf(value) === Object.prototype
        ) {
          if (objectProxy) return objectProxy;
          // Cache for nested array proxies on object properties
          const nestedArrayProxyCache = new WeakMap<object, any>();
          objectProxy = new Proxy(value as Record<string, unknown>, {
            set(_target, prop: string | symbol, newVal) {
              const current = value as Record<string, unknown>;
              // Create shallow copy and apply mutation
              const next: Record<string, unknown> = { ...current };
              next[prop as any] = newVal;
              stateObj.value = next as unknown as T;
              return true;
            },
            deleteProperty(_target, prop: string | symbol) {
              const current = value as Record<string, unknown>;
              if (!(prop in current)) return true;
              const { [prop as any]: _, ...rest } = current;
              void _; // Mark as used
              stateObj.value = rest as unknown as T;
              return true;
            },
            get(_target, prop, receiver) {
              const current = value as Record<string, unknown>;
              const out = Reflect.get(current, prop, receiver);
              // If property is an array, return a proxied array that commits back into the object
              if (Array.isArray(out)) {
                const existing = nestedArrayProxyCache.get(out);
                if (existing) return existing;
                const mutatingMethods = new Set([
                  'push',
                  'pop',
                  'shift',
                  'unshift',
                  'splice',
                  'sort',
                  'reverse',
                  'fill',
                  'copyWithin',
                ]);
                const proxied = new Proxy(out, {
                  get(arrTarget, arrProp, arrReceiver) {
                    if (
                      typeof arrProp === 'string' &&
                      mutatingMethods.has(arrProp)
                    ) {
                      return (...args: unknown[]) => {
                        const currentObj = value as Record<string, unknown>;
                        const currentArr = currentObj[prop as any] as unknown[];
                        const newArr = currentArr.slice();
                        const result = (newArr as any)[arrProp](...args);
                        const nextObj = {
                          ...currentObj,
                          [prop as any]: newArr,
                        };
                        stateObj.value = nextObj as unknown as T;
                        return result;
                      };
                    }
                    const methodOrVal = Reflect.get(
                      arrTarget,
                      arrProp,
                      arrReceiver,
                    );
                    return typeof methodOrVal === 'function'
                      ? methodOrVal.bind(arrTarget)
                      : methodOrVal;
                  },
                });
                nestedArrayProxyCache.set(out, proxied);
                return proxied;
              }
              return out;
            },
          });
          return objectProxy as unknown as T;
        }
      }
      return value;
    },
    set value(newValue: T | ((prev: T) => T | Promise<T>)) {
      if (typeof newValue === 'function') {
        const result = (newValue as (prev: T) => T | Promise<T>)(value);
        if (result instanceof Promise) {
          result.then(resolvedValue => setValue(resolvedValue));
          return;
        }
        setValue(result);
      } else {
        setValue(newValue);
      }
    },

    get requiredValue() {
      // Track this state as a dependency if we're in an effect or computed
      if (activeEffect) {
        addReadValue(stateObj);
        dependencies.add(activeEffect);
      }

      if (value === null || value === undefined) {
        const stateName = validatedName ? ` '${validatedName}'` : '';
        throw new Error(
          `Required value${stateName} is ${value === null ? 'null' : 'undefined'}. Use .value to access the actual value or ensure the state is initialized.`,
        );
      }

      return value as NonNullable<T>;
    },

    set requiredValue(newValue: NonNullable<T>) {
      if (newValue === null || newValue === undefined) {
        const stateName = validatedName ? ` '${validatedName}'` : '';
        throw new Error(
          `Cannot set required value${stateName} to ${newValue === null ? 'null' : 'undefined'}. Use .value to set null/undefined values.`,
        );
      }

      setValue(newValue as T);
    },

    toString() {
      return String(value);
    },
  };

  // Register named states for debugging
  if (typeof window !== 'undefined') {
    registerDebugItem('state', validatedName, stateObj);
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

export function setActiveEffectOptions(
  options: typeof activeEffectOptions,
): typeof activeEffectOptions {
  const prev = activeEffectOptions;
  activeEffectOptions = options;
  return prev;
}

export function getActiveEffectOptions(): typeof activeEffectOptions {
  return activeEffectOptions;
}

export function addReadValue(value: { value: any }): void {
  if (
    activeEffect &&
    activeEffectOptions?.preventLoops !== false &&
    activeEffect === currentEffect
  ) {
    readValues.add(value);
  }
}

export function clearReadValues(): void {
  readValues.clear();
}

export function wasValueRead(value: { value: any }): boolean {
  return readValues.has(value);
}

export function snapshotEffectReads(effect: () => void): void {
  effectReadValues.set(effect, new Set(readValues));
}

export function didEffectReadValue(
  effect: () => void,
  value: { value: any },
): boolean {
  const set = effectReadValues.get(effect);
  return !!set && set.has(value);
}

export function setCurrentEffect(effect: (() => void) | null): void {
  currentEffect = effect;
}

// Global flag to track if the current effect is modifying values
let isEffectModifyingValues = false;

export function setIsEffectModifyingValues(modifying: boolean): void {
  isEffectModifyingValues = modifying;
}

export function getIsEffectModifyingValues(): boolean {
  return isEffectModifyingValues;
}

export function registerEffectModification(value: { value: any }): void {
  // Register modification for the current effect (if any)
  if (currentEffect) {
    let set = effectModifiedValues.get(currentEffect);
    if (!set) {
      set = new Set();
      effectModifiedValues.set(currentEffect, set);
    }
    set.add(value);
  }
  
  // Also register modification for the active effect (if different from current effect)
  // This handles the case where an action is called from within an effect
  if (activeEffect && activeEffect !== currentEffect) {
    let set = effectModifiedValues.get(activeEffect);
    if (!set) {
      set = new Set();
      effectModifiedValues.set(activeEffect, set);
    }
    set.add(value);
  }
}

export function clearEffectModifiedValues(effect: () => void): void {
  effectModifiedValues.set(effect, new Set());
}

// Track whether the next run of a given effect was triggered by an external update
const effectTriggeredExternally = new WeakMap<() => void, boolean>();
export function markEffectTriggeredExternally(effect: () => void): void {
  effectTriggeredExternally.set(effect, true);
}
export function takeEffectTriggeredExternally(effect: () => void): boolean {
  const flag = effectTriggeredExternally.get(effect) === true;
  if (flag) effectTriggeredExternally.delete(effect);
  return flag;
}

export function wasValueModifiedByEffect(
  effect: () => void,
  value: { value: any },
): boolean {
  const set = effectModifiedValues.get(effect);
  return !!set && set.has(value);
}

export function setEffectOptions(
  effect: () => void,
  options: { once?: boolean; preventOverlap?: boolean; preventLoops?: boolean },
): void {
  effectOptions.set(effect, options);
}

export function getEffectOptions(
  effect: () => void,
):
  | { once?: boolean; preventOverlap?: boolean; preventLoops?: boolean }
  | undefined {
  return effectOptions.get(effect);
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
 * @param name - Optional name for debugging purposes
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
 * }, 'updateUserInfo');
 * ```
 */
export function batch(fn: () => void, name?: string): void {
  // Validate name if provided
  const validatedName = name ? validateStateName(name) : undefined;

  // Debug logging
  if (validatedName) {
    logDebug(`batch: '${validatedName}'`, debugConfig);
  }

  // Warn if called within an effect; effects are already batched
  if (activeEffect) {
    // eslint-disable-next-line no-console
    console.warn(
      'batch: called within an effect; this is unnecessary because effects already batch their updates',
    );
  }

  // Warn if called within an action; actions already batch updates
  if (isInAction) {
    // eslint-disable-next-line no-console
    console.warn(
      'batch: called within an action; this is unnecessary because actions already batch their updates',
    );
  }

  // If already batching, just execute the function
  if (isBatching) {
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
// Use lazy initialization to avoid issues with React hooks
let windowUnderstateInitialized = false;
export function initializeWindowUnderstate() {
  if (typeof window !== 'undefined' && !windowUnderstateInitialized) {
    (window as any).reactUnderstate = {
      configureDebug,
      states: {},
      actions: {},
      effects: {},
    };
    windowUnderstateInitialized = true;
  }
}

// Initialize on first state creation

export function getWindowUnderstate() {
  initializeWindowUnderstate();
  return (window as any).reactUnderstate;
}

// --- Debug name helpers ---
export type DebugItemKind = 'state' | 'derived' | 'effect';

export function generateRandomDebugName(kind: DebugItemKind): StateName {
  // 6 random base36 chars ensures a valid identifier suffix
  const id = Math.random().toString(36).slice(2, 8);
  return `${kind}_${id}` as StateName;
}

export function registerDebugItem(
  kind: DebugItemKind,
  proposedName: string | undefined,
  value: unknown,
): string {
  // Use window understate if available, otherwise fall back to in-memory maps for tests/node
  const windowU = getWindowUnderstate() as
    | {
        states: Record<string, unknown>;
        actions: Record<string, unknown>;
        effects: Record<string, unknown>;
      }
    | undefined;
  // Static fallback singleton
  const memoryU = (function () {
    const globalAny = globalThis as any;
    globalAny.__UNDERSTATE_MEMORY__ ??= {
      states: Object.create(null) as Record<string, unknown>,
      actions: Object.create(null) as Record<string, unknown>,
      effects: Object.create(null) as Record<string, unknown>,
    };
    return globalAny.__UNDERSTATE_MEMORY__ as {
      states: Record<string, unknown>;
      actions: Record<string, unknown>;
      effects: Record<string, unknown>;
    };
  })();
  const u = windowU ?? memoryU;
  const mapKey = kind === 'effect' ? 'effects' : 'states';
  // Ensure maps exist
  if (!(mapKey in u) || typeof (u as any)[mapKey] !== 'object') {
    (u as any)[mapKey] = Object.create(null);
  }
  const map = (u as any)[mapKey] as Record<string, unknown>;
  let finalName: StateName;

  if (proposedName) {
    const validated = validateStateName(proposedName);
    if (map[validated]) {
      const randomName = generateRandomDebugName(kind);
      // eslint-disable-next-line no-console
      console.warn(
        `${kind}: name conflict for '${validated}', using '${randomName}'`,
      );
      finalName = randomName;
    } else {
      finalName = validated;
    }
  } else {
    // No name provided, generate one
    let candidate = generateRandomDebugName(kind);
    while (map[candidate]) {
      candidate = generateRandomDebugName(kind);
    }
    finalName = candidate;
  }

  map[finalName] = kind === 'effect' ? true : value;
  return finalName;
}
