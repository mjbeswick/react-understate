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
export { state } from "./core";
export type { State } from "./core";

// Reactive exports
export { derived, effect, batch } from "./state";

// React integration exports
export { useUnderstate, setReact } from "./react";
