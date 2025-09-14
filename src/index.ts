/**
 * @fileoverview React Understate - Main Entry Point
 *
 * This is the main entry point for the React Understate library.
 * It provides reactive state management for React applications with:
 * - Automatic dependency tracking
 * - Computed values that update automatically
 * - Components re-render when state changes
 * - State persists across re-renders
 * - Lightweight and performant
 *
 * @example
 * import { state, useUnderstate, effect } from 'react-understate';
 */

// Core exports
export { state, action, configureDebug } from './core';
export type { State } from './core';

// Debug utilities
export * from './debug-utils';

// Browser debugging types are automatically available

// Reactive exports
export { derived, asyncDerived } from './derived';
export { effect } from './state';
export { batch } from './core';

// React integration exports
export { useUnderstate, setReact } from './react';

// Persistence exports
export {
  persistLocalStorage,
  persistSessionStorage,
  persistStates,
} from './persistence';
