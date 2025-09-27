/**
 * @fileoverview Tests to reproduce console context behavior with rawValue
 */

import { state, derived, effect } from './index';

describe('Console Context rawValue Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reproducing console rawValue trigger issue', () => {
    it('should not trigger effect when rawValue is accessed in console-like context', () => {
      const base = state(10);
      const derivedValue = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        derivedValue.value; // This creates the dependency
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Change the base value
      base.value = 15;
      expect(effectCount).toBe(2); // Effect should run due to .value dependency

      // Now simulate accessing rawValue in console
      // This should NOT trigger the effect
      const consoleResult = derivedValue.rawValue;
      expect(consoleResult).toBe(30);
      expect(effectCount).toBe(2); // Should still be 2, not 3

      // Change base again
      base.value = 20;
      expect(effectCount).toBe(3); // Effect should run due to .value dependency
    });

    it('should demonstrate the difference between rawValue and value access', () => {
      const base = state(5);
      const derivedValue = derived(() => base.value * 3, 'testDerived');
      let effectCount = 0;

      effect(() => {
        derivedValue.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Simulate console access patterns
      const rawAccess = () => derivedValue.rawValue;
      const valueAccess = () => derivedValue.value;

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

    it('should test the specific scenario from the user issue', () => {
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

  describe('debugging potential console context issues', () => {
    it('should test if console access somehow creates an effect context', () => {
      const base = state(10);
      const derivedValue = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        derivedValue.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Simulate various console access patterns
      const patterns = [
        () => derivedValue.rawValue,
        () => {
          const val = derivedValue.rawValue;
          return val;
        },
        () => {
          /* console.log(derivedValue.rawValue); */ return derivedValue.rawValue;
        },
        () => {
          return Number(JSON.stringify(derivedValue.rawValue));
        },
      ];

      patterns.forEach((pattern, index) => {
        const beforeCount = effectCount;
        const result = pattern();
        const afterCount = effectCount;

        expect(result).toBe(20);
        expect(afterCount).toBe(beforeCount); // Should not trigger effect
      });

      // Verify effect still works normally
      base.value = 15;
      expect(effectCount).toBe(2);
    });

    it('should test if accessing rawValue in a different execution context matters', () => {
      const base = state(10);
      const derivedValue = derived(() => base.value * 2, 'testDerived');
      let effectCount = 0;

      effect(() => {
        derivedValue.value;
        effectCount++;
      }, 'testEffect');

      expect(effectCount).toBe(1);

      // Test accessing rawValue in different contexts
      const directAccess = derivedValue.rawValue;
      const functionAccess = (() => {
        const fn = () => derivedValue.rawValue;
        return fn();
      })();
      const tryCatchAccess = (() => {
        try {
          return derivedValue.rawValue;
        } catch {
          return null;
        }
      })();

      // Test synchronous contexts
      expect(directAccess).toBe(20);
      expect(functionAccess).toBe(20);
      expect(tryCatchAccess).toBe(20);
      expect(effectCount).toBe(1); // Should not trigger effect

      // Test async context
      return new Promise(resolve => {
        setTimeout(() => {
          const asyncAccess = derivedValue.rawValue;
          expect(asyncAccess).toBe(20);
          expect(effectCount).toBe(1); // Should not trigger effect
          resolve(undefined);
        }, 0);
      });
    });
  });
});
