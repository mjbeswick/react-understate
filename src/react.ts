/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * using use-sync-external-store for optimal compatibility.
 */

import type { State, ReadonlyState } from "./core";
import { useSyncExternalStore } from "use-sync-external-store/shim";

/**
 * React hook to subscribe to a state in functional components.
 *
 * This hook automatically subscribes to state changes and triggers
 * component re-renders when the state value changes. It properly
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
 * @param signal - The state to subscribe to
 *
 * @example
 * ```tsx
 * import { state, useSubscribe } from 'react-understate';
 *
 * const userCount = state(0);
 *
 * function UserCounter() {
 *   // ✅ CORRECT: Use the hook to establish subscription
 *   useSubscribe(userCount);
 *
 *   // Access the state value directly
 *   const count = userCount.value;
 *
 *   return (
 *     <div>
 *       <p>Active users: {count}</p>
 *       <button onClick={() => userCount.value++}>
 *         Add User
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSubscribe<T>(signal: State<T> | ReadonlyState<T>): void {
  console.log("useSubscribe called for signal:", signal);
  useSyncExternalStore(
    (callback) => {
      console.log("Setting up subscription for signal");
      return signal.subscribe(() => {
        console.log(
          "Subscription triggered for signal, current value:",
          signal.value,
        );
        callback(); // This is the key - we need to call the callback to trigger re-render
      });
    },
    () => {
      const value = signal.value;
      console.log("getSnapshot called, returning value:", value);
      return value;
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
