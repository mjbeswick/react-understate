/**
 * @fileoverview React Integration for State
 *
 * This module provides React integration for the state system,
 * using use-sync-external-store for optimal compatibility.
 */

import type { State } from "./core";
import { useSyncExternalStore } from "use-sync-external-store/shim";

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
      typeof value === "object" &&
      "value" in value &&
      "subscribe" in value
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
      typeof value === "object" &&
      "value" in value &&
      "subscribe" in value
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
 * 1. Individual states: Returns void, access state values via .value
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
 * // Individual states pattern
 * const count = state(0);
 * const name = state('John');
 *
 * function Component() {
 *   useUnderstate(count, name);
 *   return <div>{count.value} - {name.value}</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Store object pattern
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
 */
export function useUnderstate<T>(signal: State<T>): void;
export function useUnderstate(...signals: State<unknown>[]): void;
export function useUnderstate<T extends Record<string, unknown>>(
  store: T,
): ExtractStateValues<T>;
export function useUnderstate<T extends Record<string, unknown>>(
  storeOrSignals: T | State<unknown>,
  ...additionalSignals: State<unknown>[]
): ExtractStateValues<T> | void {
  // Check if first argument is a store object (has properties that aren't State objects)
  const isStoreObject =
    storeOrSignals &&
    typeof storeOrSignals === "object" &&
    !("value" in storeOrSignals) &&
    !("subscribe" in storeOrSignals);

  if (isStoreObject) {
    // Store object pattern
    const store = storeOrSignals as T;
    const states = extractStatesFromStore(store);

    useSyncExternalStore(
      (callback) => {
        // Subscribe to all states in the store
        const unsubscribes = states.map((state) =>
          state.subscribe(() => {
            callback(); // Trigger re-render when any state changes
          }),
        );

        // Return cleanup function that unsubscribes from all states
        return () => {
          unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
      },
      () => {
        // Return a stable snapshot that only changes when state values actually change
        return JSON.stringify(states.map((state) => state.value));
      },
    );

    // Return an object with current values for states
    return createStoreWithValues(store);
  } else {
    // Individual states pattern (backward compatible)
    const signals = [storeOrSignals as State<unknown>, ...additionalSignals];

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
        return JSON.stringify(signals.map((signal) => signal.value));
      },
    );
  }
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
