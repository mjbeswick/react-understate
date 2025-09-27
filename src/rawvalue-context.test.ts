/**
 * @fileoverview Tests for rawValue behavior in different execution contexts
 */

import { state, derived, effect } from './index';
import { flushUpdates } from './core';

describe('rawValue Context Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rawValue in effect context', () => {
    it('should not establish dependencies when accessing rawValue in effect', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.rawValue; // Should not create dependency on base
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      base.value = 15;
      expect(effectCount).toBe(1); // Should not re-run effect
    });

    it('should establish dependencies when accessing value in effect', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value; // Should create dependency on base
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      base.value = 15;
      flushUpdates();
      expect(effectCount).toBe(2); // Should re-run effect
    });

    it('should not trigger effect when accessing rawValue outside effect context', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value; // Create dependency
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Access rawValue outside of any effect context
      const rawVal = doubled.rawValue;
      expect(rawVal).toBe(20);
      expect(effectCount).toBe(1); // Should not trigger effect

      base.value = 15;
      flushUpdates();
      expect(effectCount).toBe(2); // Effect should still run due to .value dependency
    });
  });

  describe('rawValue with stale data', () => {
    it('should return stale value when derived is dirty but not accessed', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');

      expect(doubled.rawValue).toBe(20);
      expect(doubled.value).toBe(20);

      // Change dependency but don't access value yet
      base.value = 15;

      // rawValue should always match value (both trigger recomputation)
      expect(doubled.rawValue).toBe(30); // Triggers recomputation
      expect(doubled.value).toBe(30); // Also triggers recomputation
    });

    it('should maintain consistency between rawValue and value after recomputation', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');

      expect(doubled.rawValue).toBe(doubled.value);

      base.value = 15;
      expect(doubled.value).toBe(30);
      expect(doubled.rawValue).toBe(30);
      expect(doubled.rawValue).toBe(doubled.value);
    });
  });

  describe('rawValue with complex derived values', () => {
    it('should work with object values', () => {
      const base = state({ count: 5 });
      const doubled = derived(
        () => ({ count: base.value.count * 2 }),
        'testDerived',
      );

      expect(doubled.rawValue).toEqual({ count: 10 });

      base.value = { count: 3 };
      expect(doubled.value).toEqual({ count: 6 });
      expect(doubled.rawValue).toEqual({ count: 6 });
    });

    it('should work with array values', () => {
      const base = state([1, 2, 3]);
      const doubled = derived(() => base.value.map(x => x * 2), 'testDerived');

      expect(doubled.rawValue).toEqual([2, 4, 6]);

      base.value = [4, 5, 6];
      expect(doubled.value).toEqual([8, 10, 12]);
      expect(doubled.rawValue).toEqual([8, 10, 12]);
    });

    it('should work with null and undefined values', () => {
      const base = state(10);
      const conditional = derived(
        () => (base.value > 5 ? 'valid' : null),
        'testDerived',
      );

      expect(conditional.rawValue).toBe('valid');

      base.value = 3;
      expect(conditional.value).toBe(null);
      expect(conditional.rawValue).toBe(null);
    });
  });

  describe('rawValue with error handling', () => {
    it('should handle errors in derived computation', () => {
      const base = state(10);
      const errorDerived = derived(() => {
        if (base.value === 10) {
          throw new Error('Test error');
        }
        return base.value * 2;
      }, 'errorDerived');

      expect(() => errorDerived.rawValue).toThrow('Test error');

      base.value = 5;
      expect(errorDerived.value).toBe(10);
      expect(errorDerived.rawValue).toBe(10);
    });
  });

  describe('rawValue with multiple dependencies', () => {
    it('should work with multiple dependencies', () => {
      const a = state(2);
      const b = state(3);
      const sum = derived(() => a.value + b.value, 'testDerived');

      expect(sum.rawValue).toBe(5);

      a.value = 4;
      expect(sum.value).toBe(7);
      expect(sum.rawValue).toBe(7);

      b.value = 5;
      expect(sum.value).toBe(9);
      expect(sum.rawValue).toBe(9);
    });
  });

  describe('rawValue in console context simulation', () => {
    it('should not trigger effects when accessed in console-like context', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Simulate console access - no active effect context
      const consoleAccess = () => {
        return doubled.rawValue;
      };

      const result = consoleAccess();
      expect(result).toBe(20);
      expect(effectCount).toBe(1); // Should not trigger effect

      // Change dependency
      base.value = 15;
      flushUpdates();
      expect(effectCount).toBe(2); // Effect should still run due to .value dependency
    });

    it('should not establish new dependencies when rawValue is accessed in console', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Simulate console access with rawValue
      const consoleRawAccess = () => {
        return doubled.rawValue;
      };

      const result = consoleRawAccess();
      expect(result).toBe(20);
      expect(effectCount).toBe(1);

      // Change dependency - effect should still run because of .value dependency
      base.value = 15;
      flushUpdates();
      expect(effectCount).toBe(2);
    });
  });

  describe('rawValue with async derived values', () => {
    it('should work with async derived values', async () => {
      const base = state(10);
      const asyncDoubled = derived(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return base.value * 2;
      }, 'asyncDerived');

      // rawValue should return the Promise
      expect(asyncDoubled.rawValue).toBeInstanceOf(Promise);

      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 20));

      const resolvedValue = await asyncDoubled.value;
      expect(resolvedValue).toBe(20);
    });
  });

  describe('rawValue edge cases', () => {
    it('should handle rapid successive changes', () => {
      const base = state(0);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Rapid changes
      for (let i = 1; i <= 10; i++) {
        base.value = i;
        flushUpdates();
        expect(doubled.rawValue).toBe(i * 2);
      }

      flushUpdates();

      expect(effectCount).toBe(10); // Effect re-runs for each change
    });

    it('should maintain rawValue consistency during batching', () => {
      const base = state(0);
      const doubled = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        doubled.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Batch multiple updates
      base.value = 1;
      base.value = 2;
      base.value = 3;
      flushUpdates();
      flushUpdates();

      // rawValue should reflect the final computed value
      expect(doubled.rawValue).toBe(6);
      expect(doubled.value).toBe(6);
      expect(effectCount).toBe(4); // Effect re-runs for each individual update
    });
  });
});
