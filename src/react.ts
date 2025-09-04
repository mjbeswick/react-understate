/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * using use-sync-external-store for optimal compatibility.
 */

import type { State } from './core';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

/**
 * Type utility to extract values from State objects in a store
 */
type ExtractStateValues<T> = {
  [K in keyof T]: T[K] extends State<infer U> ? U : T[K];
};

/**
 * Utility function to extract all State objects from a store object
 */
function extractStatesFromStore(
  store: Record<string, unknown>,
): State<unknown>[] {
  const states: State<unknown>[] = [];

  for (const value of Object.values(store)) {
    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      'subscribe' in value
    ) {
      states.push(value as unknown as State<unknown>);
    }
  }

  return states;
}

/**
 * Utility function to create a store object with current state values
 */
function createStoreWithValues<T extends Record<string, unknown>>(
  store: T,
): ExtractStateValues<T> {
  const result = {} as ExtractStateValues<T>;

  for (const [key, value] of Object.entries(store)) {
    // If it's a State object, return its current value
    if (
      value &&
      typeof value === 'object' &&
      'value' in value &&
      'subscribe' in value
    ) {
      (result as any)[key] = (value as unknown as State<unknown>).value;
    } else {
      // Otherwise return the original value (functions, etc.)
      (result as any)[key] = value;
    }
  }

  return result;
}

/**
 * React hook to subscribe to states in functional components.
 *
 * This hook automatically subscribes to state changes and triggers
 * component re-renders when any of the subscribed states change. It properly
 * cleans up subscriptions when the component unmounts.
 *
 * Two usage patterns:
 * 1. Individual states: Returns array of current state values
 * 2. Store object: Returns an object with current state values and functions
 *
 * Requires React 18+ - This hook uses useSyncExternalStore for optimal
 * performance and concurrent rendering support.
 *
 * No setup required - Uses use-sync-external-store/shim for automatic compatibility.
 *
 * @param storeOrSignals - Either a store object or one or more states to subscribe to
 *
 * @example
 * ```tsx
 * // Store object pattern (preferred)
 * const store = {
 *   count: state(0),
 *   name: state('John'),
 *   increment: () => store.count.value++
 * };
 *
 * function Component() {
 *   const { count, name, increment } = useUnderstate(store);
 *   return <div>{count} - {name}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Array pattern (alternative)
 * const count = state(0);
 * const name = state('John');
 *
 * function Component() {
 *   const [countValue, nameValue] = useUnderstate(count, name);
 *   return <div>{countValue} - {nameValue}</div>;
 * }
 * ```
 */

export function useUnderstate<T extends readonly State<unknown>[]>(
  ...signals: T
): { [K in keyof T]: T[K] extends State<infer U> ? U : never };
// eslint-disable-next-line no-redeclare
export function useUnderstate<T extends Record<string, unknown>>(
  store: T,
): ExtractStateValues<T>;
// eslint-disable-next-line no-redeclare
export function useUnderstate<T extends Record<string, unknown>>(
  storeOrSignals: T | State<unknown>,
  ...additionalSignals: State<unknown>[]
):
  | ExtractStateValues<T>
  | { [K in keyof T]: T[K] extends State<infer U> ? U : never } {
  // Check if first argument is a store object (has properties that aren't State objects)
  const isStoreObject =
    storeOrSignals &&
    typeof storeOrSignals === 'object' &&
    !('value' in storeOrSignals) &&
    !('subscribe' in storeOrSignals);

  if (isStoreObject) {
    // Store object pattern
    const store = storeOrSignals;
    const states = extractStatesFromStore(store);

    useSyncExternalStore(
      callback => {
        // Subscribe to all states in the store
        const unsubscribes = states.map(state =>
          state.subscribe(() => {
            callback(); // Trigger re-render when any state changes
          }),
        );

        // Return cleanup function that unsubscribes from all states
        return () => {
          unsubscribes.forEach(unsubscribe => unsubscribe());
        };
      },
      () => {
        // Return a stable snapshot that only changes when state values actually change
        return JSON.stringify(states.map(state => state.value));
      },
    );

    // Return an object with current values for states
    return createStoreWithValues(store);
  } else {
    // Individual states pattern - return array of values
    const signals = [storeOrSignals as State<unknown>, ...additionalSignals];

    useSyncExternalStore(
      callback => {
        // Subscribe to all signals
        const unsubscribes = signals.map(signal =>
          signal.subscribe(() => {
            callback(); // Trigger re-render when any signal changes
          }),
        );

        // Return cleanup function that unsubscribes from all signals
        return () => {
          unsubscribes.forEach(unsubscribe => unsubscribe());
        };
      },
      () => {
        // Return a stable snapshot that only changes when signal values actually change
        return JSON.stringify(signals.map(signal => signal.value));
      },
    );

    // Return array of current values
    return signals.map(signal => signal.value) as any;
  }
}

/**
 * @deprecated This function is no longer needed as React is automatically detected via use-sync-external-store/shim.
 * The library now works out of the box without any manual setup.
 */

export function setReact(_reactModule: unknown): void {
  // setReact() is deprecated and no longer needed
  // react-understate now uses use-sync-external-store/shim for automatic React compatibility
}
