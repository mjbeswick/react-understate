/**
 * @fileoverview React Understate - Main Entry Point
 *
 * This is the main entry point for the React Understate library.
 * It provides reactive state management for React applications with:
 * - Automatic dependency tracking
 * - Computed values that update automatically
 * - Components re-render when signals change
 * - Signals persist across re-renders
 * - Lightweight and performant
 *
 * @example
 * import { signal, useSubscribe, effect } from 'react-understate';
 */

// Core exports
export { signal } from './core';
export type { Signal, ReadonlyState } from './core';

// Reactive exports
export { derived, effect, batch } from './reactive';

// React integration exports
export { useSubscribe, setReact } from './react';
