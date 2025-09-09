/**
 * @fileoverview Effects
 *
 * This module provides reactive effects functionality for the signals system.
 * Effects automatically re-execute when their dependencies change.
 */

import {
  setActiveEffect,
  setActiveEffectOptions,
  clearReadValues,
  setCurrentEffect,
  configureDebug,
  validateStateName,
} from './core';
import { logDebug } from './debug-utils';

/**
 * Options for controlling effect execution behavior.
 */
export type EffectOptions = {
  /**
   * Only run the effect once, ignoring subsequent dependency changes.
   * Useful for one-time initialization or setup effects.
   *
   * @example
   * effect(() => {
   *   // This will only run once, even if dependencies change
   *   initializeSomething();
   * }, 'initEffect', { once: true });
   */
  once?: boolean;

  /**
   * Prevent the effect from re-running if it's already running.
   * Useful for preventing overlapping executions of async effects.
   *
   * @example
   * effect(async () => {
   *   // This won't re-run if already running
   *   await fetchData();
   * }, 'fetchEffect', { preventOverlap: true });
   */
  preventOverlap?: boolean;

  /**
   * Automatically prevent infinite loops by ignoring re-execution when
   * the effect modifies reactive values it reads. This is the default behavior.
   * Set to false to allow all dependency changes to trigger re-execution.
   *
   * @example
   * effect(() => {
   *   const a = valueA.value; // Reads valueA
   *   const b = valueB.value; // Reads valueB
   *   valueB.value = someNewValue; // Modifies valueB - won't trigger re-execution
   * }, 'effectName', { preventLoops: true }); // This is the default
   */
  preventLoops?: boolean;
};

/**
 * Runs a side effect that automatically re-executes when dependencies change.
 *
 * Effects are used to perform side effects (like DOM updates, API calls, or
 * logging) that need to happen when signals change. They automatically track
 * which signals they depend on and re-run whenever those signals change.
 *
 * Effects can return a cleanup function that will be called before the effect
 * runs again or when the effect is disposed.
 *
 * @param fn - A function that performs the side effect and optionally returns a cleanup function
 * @returns A function to dispose of the effect and stop it from running
 *
 * @example
 * ```tsx
 * import { signal } from './core';
 * import { effect } from './effects';
 *
 * const count = signal(0);
 * const name = signal('John');
 *
 * // Simple effect that logs changes
 * const dispose = effect(() => {
 *   console.log(`Count is now: ${count.value}`);
 *   console.log(`Name is now: ${name.value}`);
 * });
 *
 * count.value = 5; // Logs: "Count is now: 5"
 * name.value = 'Jane'; // Logs: "Name is now: Jane"
 *
 * // Clean up the effect
 * dispose();
 * ```
 *
 * @example
 * ```tsx
 * // Effect with cleanup function
 * const isVisible = signal(true);
 *
 * const dispose = effect(() => {
 *   if (isVisible.value) {
 *     document.body.style.overflow = 'hidden';
 *
 *     // Return cleanup function
 *     return () => {
 *       document.body.style.overflow = 'auto';
 *     };
 *   }
 * });
 *
 * // Effect runs, body overflow is hidden
 *
 * isVisible.value = false;
 * // Cleanup runs first (overflow restored to auto)
 * // Then effect runs again (no changes to overflow)
 *
 * dispose(); // Final cleanup runs
 * ```
 *
 * @example
 * ```tsx
 * // Effect for API calls
 * const userId = signal(1);
 * const userData = signal(null);
 *
 * effect(async () => {
 *   const id = userId.value;
 *   if (id) {
 *     try {
 *       const response = await fetch(`/api/users/${id}`);
 *       const data = await response.json();
 *       userData.value = data;
 *     } catch (error) {
 *       console.error('Failed to fetch user:', error);
 *     }
 *   }
 * });
 *
 * // Effect automatically re-runs when userId changes
 * userId.value = 2; // Fetches user with ID 2
 * ```
 */
export function effect(
  fn: () => void | (() => void) | Promise<void> | Promise<() => void>,
  name?: string,
  options?: EffectOptions,
): () => void {
  // Validate name if provided
  const validatedName = name ? validateStateName(name) : undefined;
  let cleanup: (() => void) | void;
  let disposed = false;
  let hasRunOnce = false;
  let isExecuting = false;

  // Set default options
  const effectOptions: EffectOptions = {
    preventLoops: true, // Default to preventing loops
    ...options,
  };

  const runEffect = () => {
    if (disposed) return;

    // Handle once option
    if (effectOptions.once && hasRunOnce) return;

    // Handle preventOverlap option
    if (effectOptions.preventOverlap && isExecuting) {
      return;
    }

    isExecuting = true;

    // Debug logging
    if (validatedName) {
      const debugConfig = configureDebug();
      logDebug(`effect: '${validatedName}' running`, debugConfig);
    }

    // Call previous cleanup before re-running
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    // Clear read values from previous execution
    clearReadValues();

    // Set current effect for loop prevention
    setCurrentEffect(runEffect);

    // Set active effect options for dependency tracking
    const prevOptions = setActiveEffectOptions(effectOptions);
    const prevEffect = setActiveEffect(runEffect);

    try {
      const result = fn();
      if (result instanceof Promise) {
        // Handle async result asynchronously
        result
          .then(cleanupResult => {
            cleanup = cleanupResult;
            // Log async resolution
            if (validatedName) {
              const debugConfig = configureDebug();
              logDebug(
                `effect: '${validatedName}' async resolved`,
                debugConfig,
              );
            }
          })
          .catch(error => {
            // Log async rejection
            if (validatedName) {
              const debugConfig = configureDebug();
              logDebug(
                `effect: '${validatedName}' async rejected: ${error}`,
                debugConfig,
              );
            }
            // eslint-disable-next-line no-console
            console.error('Effect async function failed:', error);
          })
          .finally(() => {
            setActiveEffect(prevEffect);
            setActiveEffectOptions(prevOptions);
            setCurrentEffect(null);
            isExecuting = false;
            hasRunOnce = true;
          });
      } else {
        cleanup = result;
        setActiveEffect(prevEffect);
        setActiveEffectOptions(prevOptions);
        setCurrentEffect(null);
        isExecuting = false;
        hasRunOnce = true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Effect function failed:', error);
      setActiveEffect(prevEffect);
      setActiveEffectOptions(prevOptions);
      setCurrentEffect(null);
      isExecuting = false;
      hasRunOnce = true;
    }
  };

  // Run immediately
  runEffect();

  // Register named effects for debugging
  if (validatedName && typeof window !== 'undefined') {
    // Initialize window.understate if not already done
    if (!(window as any).understate) {
      (window as any).understate = {
        configureDebug: () => ({}),
        states: {},
      };
    }
    if ((window as any).understate.states[validatedName]) {
      throw new Error(
        `Effect with name '${validatedName}' already exists. State names must be unique.`,
      );
    }
    (window as any).understate.states[validatedName] = {
      value: 'effect',
      dispose: () => {
        disposed = true;
        if (cleanup) {
          cleanup();
          cleanup = undefined;
        }
      },
    };
  }

  // Return disposal function
  return () => {
    disposed = true;
    // Call cleanup one final time
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }
  };
}
