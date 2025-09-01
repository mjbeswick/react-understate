/**
 * @fileoverview Batching
 *
 * This module provides batching functionality for the signals system.
 * Batching allows multiple signal updates to be processed together.
 */

import { setIsBatching, flushUpdates } from './core';

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
 * import { signal } from './core';
 * import { effect } from './effects';
 * import { batch } from './batch';
 *
 * const firstName = signal('John');
 * const lastName = signal('Doe');
 * const age = signal(30);
 *
 * // Effect that depends on multiple signals
 * effect(() => {
 *   console.log(`User: ${firstName.value} ${lastName.value}, Age: ${age.value}`);
 * });
 *
 * // Without batching - triggers effect 3 times
 * firstName.value = 'Jane';
 * lastName.value = 'Smith';
 * age.value = 25;
 *
 * // With batching - triggers effect only once
 * batch(() => {
 *   firstName.value = 'Jane';
 *   lastName.value = 'Smith';
 *   age.value = 25;
 * });
 * // Effect runs once with all updated values
 * ```
 *
 * @example
 * ```tsx
 * // Batching in event handlers
 * const count = signal(0);
 * const isLoading = signal(false);
 *
 * const handleClick = () => {
 *   batch(() => {
 *     isLoading.value = true;
 *     count.value++;
 *     // Both changes are processed together
 *   });
 * };
 *
 * // Effect only runs once for both changes
 * effect(() => {
 *   console.log(`State: count=${count.value}, loading=${isLoading.value}`);
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
