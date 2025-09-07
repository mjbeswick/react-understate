/**
 * @fileoverview Effects
 *
 * This module provides reactive effects functionality for the signals system.
 * Effects automatically re-execute when their dependencies change.
 */

import { setActiveEffect, configureDebug } from './core';

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
  fn: () => void | (() => void),
  name?: string,
): () => void {
  let cleanup: (() => void) | void;
  let disposed = false;

  const runEffect = () => {
    if (disposed) return;

    // Debug logging
    const debugConfig = configureDebug();
    if (debugConfig.enabled && name && debugConfig.logger) {
      debugConfig.logger(`effect: '${name}' running`);
    }

    // Call previous cleanup before re-running
    if (cleanup) {
      cleanup();
      cleanup = undefined;
    }

    const prevEffect = setActiveEffect(runEffect);

    try {
      cleanup = fn();
    } finally {
      setActiveEffect(prevEffect);
    }
  };

  // Run immediately
  runEffect();

  // Register named effects for debugging
  if (name && typeof window !== 'undefined') {
    (window as any).understate.states[name] = {
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
