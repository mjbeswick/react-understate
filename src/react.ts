/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * including the useSubscribe hook and React instance management.
 */

import type { State, ReadonlyState } from './core';

// React integration
let ReactInstance: any = null;

/**
 * Sets the React instance for state integration.
 *
 * This function must be called once with the React module before using
 * any React-specific features like `useSubscribe`.
 *
 * @param reactModule - The React module to integrate with
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { setReact } from './react';
 *
 * // Call this once at app startup
 * setReact(React);
 * ```
 */
export function setReact(reactModule: any): void {
  ReactInstance = reactModule;
}

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
  if (!ReactInstance) {
    throw new Error(
      'React not set. Call setReact(React) before using useSubscribe'
    );
  }
  ReactInstance.useSyncExternalStore(
    signal.subscribe,
    () => signal.rawValue,
    () => signal.rawValue
  );
}
