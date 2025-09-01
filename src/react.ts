/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * including the useSubscribe hook with automatic React detection.
 */

import type { State, ReadonlyState } from './core';

// React integration with automatic detection
let ReactInstance: any = null;

/**
 * Automatically detects and returns the React instance.
 * 
 * This function tries to find React in the global scope.
 * 
 * @returns The React instance
 * @throws Error if React cannot be found
 */
function getReactInstance(): any {
  if (ReactInstance) {
    return ReactInstance;
  }

  // Check if React is available globally (browser environment)
  if (typeof window !== 'undefined' && (window as any).React) {
    ReactInstance = (window as any).React;
    return ReactInstance;
  }

  // Check for React in global scope (various bundler scenarios)
  if (typeof global !== 'undefined' && (global as any).React) {
    ReactInstance = (global as any).React;
    return ReactInstance;
  }

  throw new Error(
    'React not found. Please ensure React is available in your environment. ' +
    'If you\'re using a custom React setup, you can still use setReact(React) to manually set the React instance.'
  );
}

/**
 * Sets the React instance for state integration (optional override).
 *
 * This function is provided as an optional override for cases where
 * automatic detection fails or you need to use a specific React instance.
 * In most cases, this is not needed as React is automatically detected.
 *
 * @param reactModule - The React module to integrate with
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { setReact } from 'react-understate';
 *
 * // Only needed if automatic detection fails
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
 * **No setup required** - React is automatically detected in most environments.
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
  const React = getReactInstance();
  
  if (!React.useSyncExternalStore) {
    throw new Error(
      'useSyncExternalStore not found. This hook requires React 18+. ' +
      'Please upgrade to React 18 or later.'
    );
  }
  
  React.useSyncExternalStore(
    signal.subscribe,
    () => signal.rawValue,
    () => signal.rawValue
  );
}
