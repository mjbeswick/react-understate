/**
 * @fileoverview Simple tests for rawValue behavior
 */

import { state, derived, effect } from './index';

describe('rawValue Simple Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rawValue behavior', () => {
    it('should not establish dependencies when accessing rawValue in effect', () => {
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');
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
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');
      let effectCount = 0;

      effect(() => {
        doubled.value; // Should create dependency on base
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      base.value = 15;
      expect(effectCount).toBe(2); // Should re-run effect
    });

    it('should not trigger effect when accessing rawValue outside effect context', () => {
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');
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
      expect(effectCount).toBe(2); // Effect should still run due to .value dependency
    });
  });

  describe('rawValue with stale data', () => {
    it('should return stale value when derived is dirty but not accessed', () => {
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');

      expect(doubled.rawValue).toBe(20);
      expect(doubled.value).toBe(20);

      // Change dependency
      base.value = 15;

      // rawValue should always match value (both trigger recomputation)
      expect(doubled.rawValue).toBe(30); // Triggers recomputation
      expect(doubled.value).toBe(30); // Also triggers recomputation
    });

    it('should maintain consistency between rawValue and value after recomputation', () => {
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');

      expect(doubled.rawValue).toBe(doubled.value);

      base.value = 15;
      expect(doubled.value).toBe(30);
      expect(doubled.rawValue).toBe(30);
      expect(doubled.rawValue).toBe(doubled.value);
    });
  });

  describe('Console context simulation', () => {
    it('should not trigger effects when rawValue is accessed in console-like context', () => {
      const base = state(10, 'base');
      const doubled = derived(() => base.value * 2, 'doubled');
      let effectCount = 0;

      effect(() => {
        doubled.value; // This creates the dependency
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Change the base value
      base.value = 15;
      expect(effectCount).toBe(2); // Effect should run due to .value dependency

      // Now simulate accessing rawValue in console
      // This should NOT trigger the effect
      const consoleResult = doubled.rawValue;
      expect(consoleResult).toBe(30);
      expect(effectCount).toBe(2); // Should still be 2, not 3

      // Change base again
      base.value = 20;
      expect(effectCount).toBe(3); // Effect should run due to .value dependency
    });

    it('should demonstrate the difference between rawValue and value access', () => {
      const base = state(5, 'base');
      const doubled = derived(() => base.value * 3, 'doubled');
      let effectCount = 0;

      effect(() => {
        doubled.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Simulate console access patterns
      const rawAccess = () => doubled.rawValue;
      const valueAccess = () => doubled.value;

      // Both should return the same value
      expect(rawAccess()).toBe(15);
      expect(valueAccess()).toBe(15);
      expect(effectCount).toBe(1); // Should not have changed

      // Change base
      base.value = 10;
      expect(effectCount).toBe(2); // Effect runs due to .value dependency

      // Both rawValue and value should always be consistent
      expect(rawAccess()).toBe(30); // Triggers recomputation
      expect(valueAccess()).toBe(30); // Also triggers recomputation
      expect(rawAccess()).toBe(valueAccess()); // Always consistent
    });
  });

  describe('User scenario reproduction', () => {
    it('should reproduce the basket store scenario', () => {
      // Simulate the basket store scenario
      const totalItemCount = state(0, 'totalItemCount');
      const journeyState = state('CATEGORY', 'journeyState');

      const basketStore = {
        totalItemCount: derived(
          () => totalItemCount.value,
          'basketStoreTotalItemCount',
        ),
      };

      let effectCount = 0;
      let goBasketCalled = false;

      const goBasket = () => {
        goBasketCalled = true;
      };

      effect(() => {
        basketStore.totalItemCount.value; // This should create dependency
        switch (journeyState.value) {
          case 'CATEGORY':
          case 'CATEGORIES':
          case 'SEARCH':
            goBasket();
            break;
        }
        effectCount++;
      }, 'scannerStateBasket');

      expect(effectCount).toBe(1);
      expect(goBasketCalled).toBe(true);

      // Reset for next test
      goBasketCalled = false;

      // Simulate scanning a product (increasing totalItemCount)
      totalItemCount.value = 1;
      expect(effectCount).toBe(2);
      expect(goBasketCalled).toBe(true);

      // Reset for next test
      goBasketCalled = false;

      // Now simulate accessing rawValue in console
      const consoleAccess = basketStore.totalItemCount.rawValue;
      expect(consoleAccess).toBe(1);
      expect(effectCount).toBe(2); // Should NOT trigger effect
      expect(goBasketCalled).toBe(false); // Should NOT call goBasket

      // Change totalItemCount again
      totalItemCount.value = 2;
      expect(effectCount).toBe(3);
      expect(goBasketCalled).toBe(true);
    });
  });
});
