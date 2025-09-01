/**
 * @fileoverview Core State Only - No React Integration
 *
 * This module provides just the core state functionality without React integration.
 * Use this for applications that don't need React or want to minimize bundle size.
 */

export { state } from './core';
export type { State, ReadonlyState } from './core';
export { derived, effect, batch } from './state';
