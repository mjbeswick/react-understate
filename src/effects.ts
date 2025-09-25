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
  batch,
  clearEffectModifiedValues,
  snapshotEffectReads,
  setEffectOptions,
  registerDebugItem,
  takeEffectTriggeredExternally,
} from './core';
import { logDebug } from './debug-utils';

// Global state for tracking running effects and their queues
const runningEffects = new Map<string, Promise<void>>();
const effectQueues = new Map<string, Array<() => void>>();

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
  let rerunRequestedDuringExecution = false;

  // Infinite loop detection
  const executionTimes: number[] = [];
  const MAX_EXECUTIONS_PER_SECOND = 10; // Threshold for detecting infinite loops
  const EXECUTION_HISTORY_SIZE = 20; // Keep track of last 20 executions
  const MIN_EXECUTIONS_FOR_DETECTION = 5; // Minimum executions before checking
  const DETECTION_WINDOW_MS = 1000; // Time window for detection in milliseconds

  // Set default options
  const effectOptionsObj: EffectOptions = {
    preventLoops: true, // Default to preventing loops
    preventOverlap: true, // Default to avoiding overlapping executions
    ...options,
  };

  // Register named effects for debugging
  if (validatedName && typeof window !== 'undefined') {
    registerDebugItem('effect', validatedName, true);
  }

  const runEffect = (isManualCall = false) => {
    if (disposed) return;

    // Handle once option
    if (effectOptionsObj.once && hasRunOnce) return;

    // Handle async queuing for named effects (only for manual calls)
    if (validatedName && isManualCall) {
      const isCurrentlyRunning = runningEffects.has(validatedName);

      if (isCurrentlyRunning) {
        // Abort the previous effect
        const previousEffect = runningEffects.get(validatedName);
        if (
          previousEffect &&
          typeof previousEffect === 'object' &&
          'abort' in previousEffect
        ) {
          (previousEffect as any).abort();
        }

        // Queue this execution if effect is already running
        if (!effectQueues.has(validatedName)) {
          effectQueues.set(validatedName, []);
        }
        effectQueues.get(validatedName)!.push(() => runEffect(true));
        return;
      }
    }

    // Handle preventOverlap option: if overlapping is prevented and
    // we are already executing, remember to schedule one rerun after completion
    if (effectOptionsObj.preventOverlap && isExecuting) {
      rerunRequestedDuringExecution = true;
      return;
    }

    // Infinite loop detection is only relevant when loop prevention is enabled
    if (effectOptionsObj.preventLoops !== false) {
      const now = Date.now();
      executionTimes.push(now);

      // Keep only the last N executions
      if (executionTimes.length > EXECUTION_HISTORY_SIZE) {
        executionTimes.shift();
      }

      // Check for infinite loop if we have enough execution history
      if (executionTimes.length >= MIN_EXECUTIONS_FOR_DETECTION) {
        const recentExecutions = executionTimes.filter(
          time => now - time < DETECTION_WINDOW_MS,
        );
        if (recentExecutions.length > MAX_EXECUTIONS_PER_SECOND) {
          const effectName = validatedName ?? 'unnamed effect';
          // eslint-disable-next-line no-console
          if (typeof console !== 'undefined' && console.error) {
            // eslint-disable-next-line no-console
            console.error(
              `🚨 INFINITE LOOP DETECTED in effect '${effectName}'!` +
                ` Effect has run ${recentExecutions.length} times in the last second.`,
            );
          }



          // Disable the effect to prevent further infinite loops
          disposed = true;
          return;
        }
      }
    }

    isExecuting = true;

    // Debug logging
    if (validatedName) {
      const debugConfig = configureDebug();
      logDebug(`effect: '${validatedName}' running`, debugConfig);
    }

    // Call previous cleanup before re-running
    if (cleanup) {
      try {
        cleanup();
      } catch (_e) {
        void _e;
        // Ignore cleanup errors but continue with effect execution
      }
      cleanup = undefined;
    }

    // Clear read values from previous execution
    clearReadValues();

    // Set current effect for loop prevention
    setCurrentEffect(runEffect);
    
    // Clear modified values only if this effect was triggered externally
    if (takeEffectTriggeredExternally(runEffect)) {
      clearEffectModifiedValues(runEffect);
    }
    
    clearReadValues();

    // Set active effect options for dependency tracking
    const prevOptions = setActiveEffectOptions(effectOptionsObj);
    const prevEffect = setActiveEffect(runEffect);

    try {
      // Abort previous effect if it's running
      if (validatedName) {
        const previousEffect = runningEffects.get(validatedName);
        if (
          previousEffect &&
          typeof previousEffect === 'object' &&
          'abort' in previousEffect
        ) {
          (previousEffect as any).abort();
        }
      }

      // Create abort controller for async effects
      const abortController = new AbortController();
      const system = { signal: abortController.signal };

      // Automatically batch state updates within effects to prevent infinite loops
      let result:
        | void
        | (() => void)
        | Promise<void>
        | Promise<() => void>
        | undefined;
      batch(() => {
        // Pass system object with signal to async effects
        result = (fn as any)(system);
      });
      // Snapshot reads captured during execution for loop-prevention decisions
      snapshotEffectReads(runEffect);

      if (result instanceof Promise) {
        // Track running effect for named effects
        if (validatedName) {
          // Store both the promise and abort controller
          const effectInfo = {
            promise: result as Promise<void>,
            abort: () => abortController.abort(),
          };
          runningEffects.set(validatedName, effectInfo as any);
        }

        // Release active effect context immediately for async effects so external
        // updates can schedule re-runs while this effect is still executing
        setActiveEffect(prevEffect);
        setActiveEffectOptions(prevOptions);
        setCurrentEffect(null);

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
            isExecuting = false;
            hasRunOnce = true;

            // Process queued executions for named effects or a single rerun request
            if (validatedName) {
              runningEffects.delete(validatedName);
              const queue = effectQueues.get(validatedName);
              if (queue && queue.length > 0) {
                const nextExecution = queue.shift()!;
                // Process next execution asynchronously to avoid stack overflow
                setTimeout(() => nextExecution(), 0);
              }
            }

            // If overlap was prevented and a rerun was requested while executing,
            // schedule one rerun now
            if (rerunRequestedDuringExecution) {
              rerunRequestedDuringExecution = false;
              // Only schedule rerun if loop prevention is enabled
              if (effectOptionsObj.preventLoops !== false) {
                // Invoke immediately to finish within tight test windows
                runEffect(true);
              }
            }
          });
      } else {
        // Snapshot reads captured during execution for loop-prevention decisions
        snapshotEffectReads(runEffect);
        cleanup = result as void | (() => void);
        setActiveEffect(prevEffect);
        setActiveEffectOptions(prevOptions);
        setCurrentEffect(null);
        isExecuting = false;
        hasRunOnce = true;

        // If overlap was prevented and a rerun was requested while executing,
        // schedule one rerun now
        if (rerunRequestedDuringExecution) {
          rerunRequestedDuringExecution = false;
          // Only schedule rerun if loop prevention is enabled
          if (effectOptionsObj.preventLoops !== false) {
            runEffect(true);
          }
        }
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

  // Store effect options for this effect function
  setEffectOptions(runEffect, effectOptionsObj);

  // Run immediately
  runEffect();

  // Register named effects for debugging
  if (validatedName && typeof window !== 'undefined') {
    // Ensure effects map exists and register the effect name for debugging/devtools
    registerDebugItem('effect', validatedName, true);
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
