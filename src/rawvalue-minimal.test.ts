/**
 * @fileoverview Minimal tests for rawValue behavior
 */

import { state, derived, effect } from './index';

describe('rawValue Minimal Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not establish dependencies when accessing rawValue in effect', () => {
    const base = state(10);
    const doubled = derived(() => base.value * 2);
    let effectCount = 0;

    effect(() => {
      doubled.rawValue; // Should not create dependency on base
      effectCount++;
    });

    expect(effectCount).toBe(1);

    base.value = 15;
    expect(effectCount).toBe(1); // Should not re-run effect
  });

  it('should establish dependencies when accessing value in effect', () => {
    const base = state(10);
    const doubled = derived(() => base.value * 2);
    let effectCount = 0;

    effect(() => {
      doubled.value; // Should create dependency on base
      effectCount++;
    });

    expect(effectCount).toBe(1);

    base.value = 15;
    expect(effectCount).toBe(2); // Should re-run effect
  });

  it('should not trigger effect when accessing rawValue outside effect context', () => {
    const base = state(10);
    const doubled = derived(() => base.value * 2);
    let effectCount = 0;

    effect(() => {
      doubled.value; // Create dependency
      effectCount++;
    });

    expect(effectCount).toBe(1);

    // Access rawValue outside of any effect context
    const rawVal = doubled.rawValue;
    expect(rawVal).toBe(20);
    expect(effectCount).toBe(1); // Should not trigger effect

    base.value = 15;
    expect(effectCount).toBe(2); // Effect should still run due to .value dependency
  });

  it('should return stale value when derived is dirty but not accessed', () => {
    const base = state(10);
    const doubled = derived(() => base.value * 2);

    expect(doubled.rawValue).toBe(20);
    expect(doubled.value).toBe(20);

    // Change dependency but don't access value yet
    base.value = 15;

    // rawValue should always match value (both trigger recomputation)
    expect(doubled.rawValue).toBe(30); // Triggers recomputation
    expect(doubled.value).toBe(30); // Also triggers recomputation
  });
});
