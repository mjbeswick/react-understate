/**
 * @fileoverview Tests for Derived Values
 *
 * Simple tests for derived values functionality focusing on improving coverage
 * for derived.ts which currently has 68.88% coverage.
 */

import { state } from './core';
import { derived } from './derived';

describe('Derived Values', () => {
  describe('Basic Functionality', () => {
    it('should create a derived value that updates when dependencies change', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      expect(doubled.value).toBe(20);

      base.value = 15;
      expect(doubled.value).toBe(30);
    });

    it('should work with multiple dependencies', () => {
      const firstName = state('John');
      const lastName = state('Doe');
      const fullName = derived(() => `${firstName.value} ${lastName.value}`);

      expect(fullName.value).toBe('John Doe');

      firstName.value = 'Jane';
      expect(fullName.value).toBe('Jane Doe');

      lastName.value = 'Smith';
      expect(fullName.value).toBe('Jane Smith');
    });

    it('should be read-only (setter should throw)', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      expect(() => {
        (doubled as any).value = 100;
      }).toThrow(); // Should throw since it's a getter-only property
    });

    it('should provide rawValue property', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      expect(doubled.rawValue).toBe(20);

      base.value = 5;
      // rawValue might be stale until value is accessed
      expect(doubled.value).toBe(10);
    });

    it('should return false for pending property', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      expect(doubled.pending).toBe(false);

      base.value = 15;
      expect(doubled.pending).toBe(false);
    });
  });

  describe('Lazy Evaluation', () => {
    it('should not recompute until value is accessed', () => {
      const base = state(10);
      let computeCount = 0;

      const doubled = derived(() => {
        computeCount++;
        return base.value * 2;
      });

      expect(computeCount).toBe(1); // Initial computation

      base.value = 15;
      expect(computeCount).toBe(1); // Still 1 - not recomputed yet

      expect(doubled.value).toBe(30);
      expect(computeCount).toBe(2); // Now recomputed
    });

    it('should not recompute if dependencies have not changed', () => {
      const base = state(10);
      let computeCount = 0;

      const doubled = derived(() => {
        computeCount++;
        return base.value * 2;
      });

      expect(doubled.value).toBe(20);
      expect(computeCount).toBe(1);

      // Access again without changing dependency
      expect(doubled.value).toBe(20);
      expect(computeCount).toBe(1); // Should not recompute
    });
  });

  describe('Subscription', () => {
    it('should notify subscribers when value changes', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      let notificationCount = 0;
      const unsubscribe = doubled.subscribe(() => {
        notificationCount++;
      });

      base.value = 15;
      // Access the value to trigger the derived computation
      doubled.value;

      expect(notificationCount).toBeGreaterThan(0);
      unsubscribe();
    });

    it('should properly cleanup subscriptions', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      let notificationCount = 0;
      const unsubscribe = doubled.subscribe(() => {
        notificationCount++;
      });

      unsubscribe();

      base.value = 15;
      doubled.value; // Access to trigger update

      expect(notificationCount).toBe(0); // Should not be called after unsubscribe
    });
  });

  describe('Error Handling', () => {
    it('should handle errors during initial computation', () => {
      const base = state(10);

      const errorDerived = derived(() => {
        if (base.value === 10) {
          throw new Error('Test error');
        }
        return base.value * 2;
      });

      // Should not throw during creation, but store undefined
      expect(errorDerived.rawValue).toBeUndefined();

      // Should recompute when accessed and dependency changes
      base.value = 5;
      expect(errorDerived.value).toBe(10);
    });

    it('should handle errors during recomputation', () => {
      const base = state(5);

      const errorDerived = derived(() => {
        if (base.value === 10) {
          throw new Error('Test error');
        }
        return base.value * 2;
      });

      expect(errorDerived.value).toBe(10); // Initial computation works

      base.value = 10;
      expect(() => errorDerived.value).toThrow('Test error');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple independent derived values', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);
      const tripled = derived(() => base.value * 3);

      expect(doubled.value).toBe(20);
      expect(tripled.value).toBe(30);

      base.value = 5;
      expect(doubled.value).toBe(10);
      expect(tripled.value).toBe(15);
    });
  });

  describe('Conditional Dependencies', () => {
    it('should handle conditional logic', () => {
      const flag = state(true);
      const a = state(10);
      const b = state(20);

      const conditional = derived(() => {
        return flag.value ? a.value : b.value;
      });

      expect(conditional.value).toBe(10);

      flag.value = false;
      expect(conditional.value).toBe(20);
    });
  });

  describe('Performance', () => {
    it('should handle many subscriptions efficiently', () => {
      const base = state(10);
      const doubled = derived(() => base.value * 2);

      const unsubscribers: (() => void)[] = [];

      // Create many subscriptions
      for (let i = 0; i < 100; i++) {
        unsubscribers.push(doubled.subscribe(() => {}));
      }

      // Cleanup all subscriptions
      unsubscribers.forEach((unsub) => unsub());

      // Should still work normally
      expect(doubled.value).toBe(20);
      base.value = 15;
      expect(doubled.value).toBe(30);
    });
  });
});
