/**
 * @fileoverview Core Signals Only - No React Integration
 *
 * This module provides just the core signals functionality without React integration.
 * Use this for applications that don't need React or want to minimize bundle size.
 */

export { signal } from './core';
export type { Signal, ReadonlyState } from './core';
export { derived, effect, batch } from './reactive';
