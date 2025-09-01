/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * using use-sync-external-store for optimal compatibility.
 */

import type { State, ReadonlyState } from "./core";
import { useSyncExternalStore } from "use-sync-external-store/shim";

/**
 * React hook to subscribe to one or more states in functional components.
 *
 * This hook automatically subscribes to state changes and triggers
 * component re-renders when any of the subscribed states change. It properly
 * cleans up subscriptions when the component unmounts.
 *
 * **Important:** This hook does NOT return a value. Instead, access
 * the state's `.value` property directly in your component. This
 * ensures proper reactivity and avoids confusion about how to use states.
 *
 * **Requires React 18+** - This hook uses `useSyncExternalStore` for optimal
 * performance and concurrent rendering support.
 *
 * **No setup required** - Uses use-sync-external-store/shim for automatic compatibility.
 *
 * @param signals - One or more states to subscribe to
 *
 * @example
 * ```tsx
 * import { state, useSubscribe } from 'react-understate';
 *
 * const userCount = state(0);
 * const userName = state('John');
 *
 * function UserProfile() {
 *   // ✅ CORRECT: Subscribe to multiple states at once
 *   useSubscribe(userCount, userName);
 *
 *   // Access the state values directly
 *   const count = userCount.value;
 *   const name = userName.value;
 *
 *   return (
 *     <div>
 *       <p>User: {name}</p>
 *       <p>Active users: {count}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // ✅ CORRECT: Single state subscription (backward compatible)
 * useSubscribe(userCount);
 *
 * // ✅ CORRECT: Multiple state subscription
 * useSubscribe(userCount, userName, isOnline);
 * ```
 */
export function useSubscribe<T>(signal: State<T> | ReadonlyState<T>): void;
export function useSubscribe(
  ...signals: (State<unknown> | ReadonlyState<unknown>)[]
): void;
export function useSubscribe(
  ...signals: (State<unknown> | ReadonlyState<unknown>)[]
): void {
  useSyncExternalStore(
    (callback) => {
      // Subscribe to all signals
      const unsubscribes = signals.map((signal) =>
        signal.subscribe(() => {
          callback(); // Trigger re-render when any signal changes
        }),
      );

      // Return cleanup function that unsubscribes from all signals
      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    },
    () => {
      // Return a stable snapshot that only changes when signal values actually change
      // Use JSON.stringify to create a stable hash of all signal values
      return JSON.stringify(signals.map((signal) => signal.value));
    },
  );
}

/**
 * @deprecated This function is no longer needed as React is automatically detected via use-sync-external-store/shim.
 * The library now works out of the box without any manual setup.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setReact(_reactModule: unknown): void {
  console.warn(
    "setReact() is deprecated and no longer needed. " +
      "react-understate now uses use-sync-external-store/shim for automatic React compatibility.",
  );
}
