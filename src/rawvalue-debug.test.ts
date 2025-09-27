/**
 * @fileoverview Debug tests for rawValue behavior
 */

import { state, derived, effect } from './index';

describe('rawValue Debug Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work exactly like the debug script', () => {
    const base = state(10, 'base');
    const doubled = derived(() => {
      return base.value * 2;
    }, 'doubled');

    let effectCount = 0;
    const effectDispose = effect(() => {
      effectCount++;
      doubled.value; // Access the derived value
    }, 'testEffect');

    expect(effectCount).toBe(1);

    // Change the base value
    base.value = 15;
    expect(effectCount).toBe(2); // Should trigger effect

    effectDispose();
  });

  it('should work with direct state access', () => {
    const directState = state(5, 'directState');
    let directEffectCount = 0;

    const directEffectDispose = effect(() => {
      directEffectCount++;
      directState.value; // Access the state directly
    }, 'directEffect');

    expect(directEffectCount).toBe(1);

    // Change the state
    directState.value = 10;
    expect(directEffectCount).toBe(2); // Should trigger effect

    directEffectDispose();
  });

  it('should not trigger effect when accessing rawValue', () => {
    const base = state(10, 'base');
    const doubled = derived(() => {
      return base.value * 2;
    }, 'doubled');

    let effectCount = 0;
    const effectDispose = effect(() => {
      effectCount++;
      doubled.value; // Access the derived value
    }, 'testEffect');

    expect(effectCount).toBe(1);

    // Change the base value
    base.value = 15;
    expect(effectCount).toBe(2); // Should trigger effect

    // Access rawValue - should not trigger effect
    const rawVal = doubled.rawValue;
    expect(rawVal).toBe(30);
    expect(effectCount).toBe(2); // Should still be 2

    effectDispose();
  });
});
