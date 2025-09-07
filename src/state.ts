/**
 * @fileoverview State Functions - Compatibility Layer
 *
 * This module re-exports all state functions (derived, effect, batch) for
 * backward compatibility and convenience. Use this when you need multiple
 * state functions, or import them individually for better tree-shaking.
 */

export { derived } from './derived';
export { effect } from './effects';
