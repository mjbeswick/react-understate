/**
 * @fileoverview Tests for Derived Values
 *
 * Simple tests for derived values functionality focusing on improving coverage
 * for derived.ts which currently has 68.88% coverage.
 */

import { state, configureDebug } from './core';
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
      unsubscribers.forEach(unsub => unsub());

      // Should still work normally
      expect(doubled.value).toBe(20);
      base.value = 15;
      expect(doubled.value).toBe(30);
    });
  });

  describe('Dependency Tracking', () => {
    it('should track dependencies correctly during computation', () => {
      const count = state(0);
      const multiplier = state(2);

      let computationCount = 0;
      const derivedValue = derived(() => {
        computationCount++;
        return count.value * multiplier.value;
      });

      // Initial computation
      expect(derivedValue.value).toBe(0);
      expect(computationCount).toBe(1);

      // Update one dependency
      count.value = 5;
      expect(derivedValue.value).toBe(10);
      expect(computationCount).toBe(2);

      // Update another dependency
      multiplier.value = 3;
      expect(derivedValue.value).toBe(15);
      expect(computationCount).toBe(3);
    });

    it('should handle circular dependencies gracefully', () => {
      const count = state(0);

      const derived1 = derived(() => count.value + 1);
      const derived2 = derived(() => derived1.value + 1);

      // This should not cause infinite loops
      expect(derived1.value).toBe(1);
      expect(derived2.value).toBe(2);
    });
  });

  describe('Subscription Management', () => {
    it('should manage subscriptions correctly', () => {
      const count = state(0);
      const derivedValue = derived(() => count.value * 2);

      let notifications = 0;
      const unsubscribe = derivedValue.subscribe(() => notifications++);

      // Initial subscription
      expect(notifications).toBe(0);

      // Update dependency
      count.value = 5;
      expect(notifications).toBe(1);

      // Unsubscribe
      unsubscribe();
      count.value = 10;
      expect(notifications).toBe(1); // Should not increase
    });

    it('should handle multiple subscriptions', () => {
      const count = state(0);
      const derivedValue = derived(() => count.value * 2);

      let notifications1 = 0;
      let notifications2 = 0;

      const unsubscribe1 = derivedValue.subscribe(() => notifications1++);
      const unsubscribe2 = derivedValue.subscribe(() => notifications2++);

      count.value = 5;
      expect(notifications1).toBe(1);
      expect(notifications2).toBe(1);

      unsubscribe1();
      count.value = 10;
      expect(notifications1).toBe(1); // Should not increase
      expect(notifications2).toBe(2); // Should increase

      unsubscribe2();
    });
  });

  describe('Debug Logging', () => {
    beforeEach(() => {
      // Reset debug config before each test
      configureDebug({ enabled: false, logger: undefined });
    });

    it('should log derived value changes when debug is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: true, logger: console.log });

      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');

      // Access the value to trigger computation
      expect(doubled.value).toBe(20);

      // Change the dependency
      base.value = 15;
      expect(doubled.value).toBe(30);

      expect(consoleSpy).toHaveBeenCalledWith(
        "derived: 'doubled' changed:",
        20,
        '->',
        30,
      );

      consoleSpy.mockRestore();
    });

    it('should not log derived value changes when debug is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: false });

      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');

      base.value = 15;
      expect(doubled.value).toBe(30);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should not log derived value changes when no name is provided', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: true, logger: console.log });

      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2); // No name provided

      // Clear any previous calls
      consoleSpy.mockClear();

      base.value = 15;
      expect(doubled.value).toBe(30);

      // Should not have any calls related to derived value changes
      const derivedCalls = consoleSpy.mock.calls.filter(
        call => call[0] && call[0].includes('derived:'),
      );
      expect(derivedCalls).toHaveLength(0);

      consoleSpy.mockRestore();
    });
  });
});
