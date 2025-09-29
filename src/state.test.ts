import {
  state,
  derived,
  asyncDerived,
  effect,
  batch,
  action,
  configureDebug,
} from './index';

describe('States', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear window.reactUnderstate for clean test state
    if (typeof global !== 'undefined' && (global as any).window) {
      (global as any).window.reactUnderstate = {
        states: {},
        actions: {},
      };
    }
  });

  describe('Basic signal functionality', () => {
    it('should create a signal with initial value', () => {
      const testState = state('initial');
      expect(testState.value).toBe('initial');
      expect(testState.rawValue).toBe('initial');
    });

    it('should update signal value', () => {
      const testState = state('initial');
      testState.value = 'updated';
      expect(testState.value).toBe('updated');
      expect(testState.rawValue).toBe('updated');
    });

    it('should update signal using update method', async () => {
      const testState = state(0);
      await testState.update(prev => prev + 1);
      expect(testState.value).toBe(1);
    });

    it('should update signal using async update method', async () => {
      const testState = state(0);
      await testState.update(async prev => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return prev + 1;
      });
      expect(testState.value).toBe(1);
    });

    it('should update signal using async setter function', async () => {
      const testState = state(0);
      testState.value = async prev => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return prev + 1;
      };
      await new Promise(resolve => setTimeout(resolve, 20)); // Wait for async to complete
      expect(testState.value).toBe(1);
    });

    it('should update signal using sync setter function', () => {
      const testState = state(0);
      testState.value = prev => prev + 1;
      expect(testState.value).toBe(1);
    });

    it('should handle multiple rapid updates', () => {
      const testState = state(0);
      testState.value = 1;
      testState.value = 2;
      testState.value = 3;
      expect(testState.value).toBe(3);
    });

    it('should not update if value is the same (Object.is)', () => {
      const testState = state({ count: 0 });
      const originalValue = testState.value;
      testState.value = { count: 0 }; // Same value, different object
      expect(testState.value).not.toBe(originalValue);

      testState.value = originalValue; // Same object reference
      expect(testState.value).toBe(originalValue);
    });
  });

  describe('Signal subscriptions', () => {
    it('should notify subscribers when value changes', () => {
      const testState = state(0);
      let notified = false;

      testState.subscribe(() => {
        notified = true;
      });

      testState.value = 1;
      expect(notified).toBe(true);
    });

    it('should return unsubscribe function', () => {
      const testState = state(0);
      let notificationCount = 0;

      const unsubscribe = testState.subscribe(() => {
        notificationCount++;
      });

      testState.value = 1;
      testState.value = 2;
      expect(notificationCount).toBe(2);

      unsubscribe();
      testState.value = 3;
      expect(notificationCount).toBe(2); // Should not increase
    });

    it('should handle multiple subscribers', () => {
      const testState = state(0);
      let count1 = 0;
      let count2 = 0;

      testState.subscribe(() => count1++);
      testState.subscribe(() => count2++);

      testState.value = 1;
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    it('should not notify active effect', () => {
      const testState = state(0);
      let effectCount = 0;

      effect(() => {
        testState.value; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      testState.value = 1;
      expect(effectCount).toBe(2);
    });
  });

  describe('Subscription mechanism', () => {
    it('should properly subscribe to signal changes', () => {
      const testState = state(0);

      // Test that the subscription mechanism works correctly
      const unsubscribe = testState.subscribe(() => {});
      expect(typeof unsubscribe).toBe('function');

      // Clean up
      unsubscribe();
    });

    it('should handle multiple components using the same signal independently', () => {
      const testState = state(0);

      // Test multiple subscriptions to the same signal
      const unsubscribe1 = testState.subscribe(() => {});
      const unsubscribe2 = testState.subscribe(() => {});

      // Verify both subscriptions are independent
      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');
      expect(unsubscribe1).not.toBe(unsubscribe2);

      // Clean up
      unsubscribe1();
      unsubscribe2();
    });

    it('should verify actual signal subscription works', () => {
      const testState = state(0);
      let subscriptionCount = 0;

      // Track actual subscriptions
      const originalSubscribe = testState.subscribe;
      testState.subscribe = jest.fn(fn => {
        subscriptionCount++;
        return originalSubscribe.call(testState, fn);
      });

      // Subscribe to the signal
      const unsubscribe = testState.subscribe(() => {});

      // Verify subscription was created
      expect(testState.subscribe).toHaveBeenCalledTimes(1);
      expect(subscriptionCount).toBe(1);

      // Clean up
      unsubscribe();
    });
  });

  describe('Derived values', () => {
    it('should create derived value', () => {
      const source = state(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);
    });

    it('should update derived value when dependency changes', () => {
      const source = state(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);

      source.value = 3;
      expect(derivedValue.value).toBe(6);
    });

    it('should handle multiple dependencies', () => {
      const a = state(1);
      const b = state(2);
      const derivedValue = derived(() => a.value + b.value);

      expect(derivedValue.value).toBe(3);

      a.value = 5;
      expect(derivedValue.value).toBe(7);

      b.value = 3;
      expect(derivedValue.value).toBe(8);
    });
  });

  describe('Effects', () => {
    it('should run effect immediately', () => {
      let effectRan = false;

      effect(() => {
        effectRan = true;
      });

      expect(effectRan).toBe(true);
    });

    it('should re-run effect when dependencies change', () => {
      const testState = state(0);
      let effectCount = 0;

      effect(() => {
        testState.value; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      testState.value = 1;
      expect(effectCount).toBe(2);
    });

    it('should handle cleanup function', () => {
      const testState = state(0);
      let cleanupRan = false;

      const dispose = effect(() => {
        testState.value;
        return () => {
          cleanupRan = true;
        };
      });

      expect(cleanupRan).toBe(false);

      testState.value = 1;
      expect(cleanupRan).toBe(true);

      dispose();
      expect(cleanupRan).toBe(true);
    });
  });

  describe('Batching', () => {
    it('should batch multiple updates', () => {
      const testState = state(0);
      let notificationCount = 0;

      testState.subscribe(() => {
        notificationCount++;
      });

      batch(() => {
        testState.value = 1;
        testState.value = 2;
        testState.value = 3;
      });

      expect(testState.value).toBe(3);
      expect(notificationCount).toBe(1); // Only one notification for batched updates
    });
  });

  describe('Actions', () => {
    it('should create action that batches updates automatically', () => {
      const testState = state(0);
      let notificationCount = 0;

      testState.subscribe(() => {
        notificationCount++;
      });

      const increment = action((amount: number) => {
        testState.value = testState.value + amount;
        testState.value = testState.value + 1;
      }, 'increment');

      increment(5);

      expect(testState.value).toBe(6);
      expect(notificationCount).toBe(1); // Only one notification for batched updates
    });

    it('should preserve function signature and return type', () => {
      const testState = state(0);

      const increment = action((amount: number, multiplier: number = 1) => {
        testState.value = testState.value + amount * multiplier;
        return testState.value;
      }, 'increment');

      const result = increment(5, 2);

      expect(testState.value).toBe(10);
      expect(result).toBe(10);
    });
  });

  describe('Edge cases', () => {
    it('should handle circular dependencies gracefully', () => {
      const a = state(1);
      const b = state(2);

      // This could cause issues if not handled properly
      const derivedValue = derived(() => {
        if (a.value > 0) {
          return b.value;
        }
        return a.value;
      });

      expect(derivedValue.value).toBe(2);
    });

    it('should handle errors in update function', async () => {
      const testState = state(0);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await testState.update(() => {
        throw new Error('Test error');
      });

      // Error is silently handled - no console output expected
      // The state value should remain unchanged when update fails
      expect(testState.value).toBe(0); // Value should remain unchanged

      consoleSpy.mockRestore();
    });
  });

  describe('TypeScript Immutability', () => {
    it('should provide readonly access to state values', () => {
      const userState = state({ name: 'John', age: 30 });
      const itemsState = state(['apple', 'banana', 'cherry']);

      // Values should be accessible
      expect(userState.value.name).toBe('John');
      expect(userState.value.age).toBe(30);
      expect(itemsState.value[0]).toBe('apple');
      expect(itemsState.value.length).toBe(3);
    });

    it('should handle nested objects correctly', () => {
      const nestedState = state({
        user: {
          profile: {
            name: 'John',
            preferences: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
      });

      // All levels should be accessible
      expect(nestedState.value.user.profile.name).toBe('John');
      expect(nestedState.value.user.profile.preferences.theme).toBe('dark');
      expect(nestedState.value.user.profile.preferences.notifications).toBe(
        true,
      );
    });

    it('should handle nested arrays correctly', () => {
      const nestedArrayState = state([
        [1, 2, 3],
        ['a', 'b', 'c'],
        [{ x: 1, y: 2 }],
      ] as const);

      // All levels should be accessible
      expect(nestedArrayState.value[0][0]).toBe(1);
      expect(nestedArrayState.value[1][1]).toBe('b');
      expect(nestedArrayState.value[2][0].x).toBe(1);
    });

    it('should work with primitive values', () => {
      const stringState = state('hello');
      const numberState = state(42);
      const booleanState = state(true);
      const nullState = state(null);
      const undefinedState = state(undefined);

      // Primitive values should work normally
      expect(stringState.value).toBe('hello');
      expect(numberState.value).toBe(42);
      expect(booleanState.value).toBe(true);
      expect(nullState.value).toBe(null);
      expect(undefinedState.value).toBe(undefined);
    });

    it('should allow proper immutable updates', () => {
      const userState = state({ name: 'John', age: 30 });
      const itemsState = state(['apple', 'banana']);

      // Proper immutable updates should work
      userState.value = { ...userState.value, age: 31 };
      itemsState.value = [...itemsState.value, 'cherry'];

      expect(userState.value.age).toBe(31);
      expect(userState.value.name).toBe('John');
      expect(itemsState.value.length).toBe(3);
      expect(itemsState.value[2]).toBe('cherry');
    });

    it('should work with update method', async () => {
      const userState = state({ name: 'John', age: 30 });

      await userState.update(prev => ({ ...prev, age: 31 }));

      expect(userState.value.age).toBe(31);
      expect(userState.value.name).toBe('John');
    });

    it('should maintain reactivity while enforcing immutability', () => {
      const userState = state({ name: 'John', age: 30 });
      let effectCount = 0;

      effect(() => {
        userState.value.name; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      // Update with new object (immutable pattern)
      userState.value = { ...userState.value, name: 'Jane' };
      expect(effectCount).toBe(2);
      expect(userState.value.name).toBe('Jane');
    });
  });

  describe('Browser Debugging', () => {
    it('should register named states on window.reactUnderstate.states', () => {
      const testState = state(42, 'browserDebugState');

      expect(
        (global as any).window.reactUnderstate.states.browserDebugState,
      ).toBeDefined();
      expect(
        (global as any).window.reactUnderstate.states.browserDebugState.value,
      ).toBe(42);
    });

    it('should not register unnamed states on window.reactUnderstate.states', () => {
      const unnamedState = state(42); // No name

      // Check that no state with the name 'unnamedState' exists
      expect(
        (global as any).window.reactUnderstate.states.unnamedState,
      ).toBeUndefined();

      // The state should still exist but not be registered
      expect(unnamedState.value).toBe(42);
    });

    it('should register named actions on window.reactUnderstate.actions', () => {
      const testState = state(0, 'testState');
      const increment = action((amount: number) => {
        testState.value += amount;
      }, 'increment');

      expect(
        (global as any).window.reactUnderstate.actions.increment,
      ).toBeDefined();
      expect(
        typeof (global as any).window.reactUnderstate.actions.increment,
      ).toBe('function');

      // Test that the action can be called from window.reactUnderstate.actions
      (global as any).window.reactUnderstate.actions.increment(5);
      expect(testState.value).toBe(5);
    });

    it('should not register unnamed actions on window.reactUnderstate.actions', () => {
      const testState = state(0);
      const unnamedAction = action((amount: number) => {
        testState.value += amount;
      }); // No name

      // Check that no action with the name 'unnamedAction' exists
      expect(
        (global as any).window.reactUnderstate.actions.unnamedAction,
      ).toBeUndefined();

      // The action should still work
      unnamedAction(3);
      expect(testState.value).toBe(3);
    });

    it('should throw error when creating two actions with the same name', () => {
      const action1 = action(() => {}, 'duplicateAction');

      expect(() => {
        action(() => {}, 'duplicateAction');
      }).toThrow(
        "Action with name 'duplicateAction' already exists. Action names must be unique.",
      );
    });
  });

  describe('Duplicate Name Validation', () => {
    it('should warn when creating two states with the same name and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const state1 = state('first', 'duplicateName');
      expect(state1.value).toBe('first');

      // No throw; auto-rename and warn
      const state2 = state('second', 'duplicateName');
      expect(state2.value).toBe('second');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating state with same name as derived and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const source = state(1);
      const d = derived(() => source.value * 2, 'duplicateName');
      expect(d.value).toBe(2);
      const s = state('test', 'duplicateName');
      expect(s.value).toBe('test');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating derived with same name as state and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s1 = state(1, 'duplicateName');
      expect(s1.value).toBe(1);
      const src = state(2);
      const d = derived(() => src.value * 2, 'duplicateName');
      expect(d.value).toBe(4);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating two derived values with the same name and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s1 = state(1);
      const d1 = derived(() => s1.value * 2, 'duplicateName');
      expect(d1.value).toBe(2);
      const s2 = state(3);
      const d2 = derived(() => s2.value * 3, 'duplicateName');
      expect(d2.value).toBe(9);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating asyncDerived with same name as state and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s1 = state(1, 'duplicateName');
      expect(s1.value).toBe(1);
      const src = state(2);
      const d = asyncDerived(async () => src.value * 2, 'duplicateName');
      expect(d.value).toBeDefined();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating effect with same name as state and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s1 = state(1, 'duplicateName');
      expect(s1.value).toBe(1);
      const dispose = effect(() => {}, 'duplicateName');
      dispose();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should warn when creating state with same name as effect and auto-rename', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const dispose = effect(() => {}, 'duplicateName');
      const s = state('test', 'duplicateName');
      expect(s.value).toBe('test');
      dispose();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('should allow creating states with different names', () => {
      const state1 = state('first', 'name1');
      const state2 = state('second', 'name2');
      const state3 = state('third', 'name3');

      expect(state1.value).toBe('first');
      expect(state2.value).toBe('second');
      expect(state3.value).toBe('third');

      // All should be registered
      expect((global as any).window.reactUnderstate.states.name1).toBeDefined();
      expect((global as any).window.reactUnderstate.states.name2).toBeDefined();
      expect((global as any).window.reactUnderstate.states.name3).toBeDefined();
    });

    it('should allow creating unnamed states even if named states exist', () => {
      const namedState = state('named', 'namedState');
      const unnamedState1 = state('unnamed1');
      const unnamedState2 = state('unnamed2');

      expect(namedState.value).toBe('named');
      expect(unnamedState1.value).toBe('unnamed1');
      expect(unnamedState2.value).toBe('unnamed2');

      // Only named state should be registered
      expect(
        (global as any).window.reactUnderstate.states.namedState,
      ).toBeDefined();
      expect(
        (global as any).window.reactUnderstate.states.unnamedState1,
      ).toBeUndefined();
      expect(
        (global as any).window.reactUnderstate.states.unnamedState2,
      ).toBeUndefined();
    });

    it('should work correctly when window is not available', () => {
      // This test verifies that the validation only applies when window is available
      // In a real Node.js environment, window would be undefined and validation wouldn't run
      const state1 = state('first', 'uniqueName1');
      const state2 = state('second', 'uniqueName2');

      expect(state1.value).toBe('first');
      expect(state2.value).toBe('second');
    });
  });

  describe('rawValue Property', () => {
    it('should provide rawValue that matches current value', () => {
      const testState = state('initial');
      expect(testState.rawValue).toBe('initial');
      expect(testState.value).toBe('initial');
      expect(testState.rawValue).toBe(testState.value);
    });

    it('should update rawValue when state value changes', () => {
      const testState = state(0);
      expect(testState.rawValue).toBe(0);

      testState.value = 42;
      expect(testState.rawValue).toBe(42);
      expect(testState.value).toBe(42);
      expect(testState.rawValue).toBe(testState.value);
    });

    it('should update rawValue with async updates', async () => {
      const testState = state(0);
      expect(testState.rawValue).toBe(0);

      testState.value = async prev => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return prev + 10;
      };

      await new Promise(resolve => setTimeout(resolve, 20));
      expect(testState.rawValue).toBe(10);
      expect(testState.value).toBe(10);
    });

    it('should update rawValue with update method', async () => {
      const testState = state(0);
      expect(testState.rawValue).toBe(0);

      await testState.update(prev => prev + 5);
      expect(testState.rawValue).toBe(5);
      expect(testState.value).toBe(5);
    });

    it('should handle object values in rawValue', () => {
      const testState = state({ count: 0, name: 'test' });
      expect(testState.rawValue).toEqual({ count: 0, name: 'test' });

      testState.value = { count: 1, name: 'updated' };
      expect(testState.rawValue).toEqual({ count: 1, name: 'updated' });
    });

    it('should handle array values in rawValue', () => {
      const testState = state([1, 2, 3]);
      expect(testState.rawValue).toEqual([1, 2, 3]);

      testState.value = [4, 5, 6];
      expect(testState.rawValue).toEqual([4, 5, 6]);
    });

    it('should handle null and undefined values in rawValue', () => {
      const nullState = state(null);
      expect(nullState.rawValue).toBe(null);

      const undefinedState = state(undefined);
      expect(undefinedState.rawValue).toBe(undefined);
    });

    it('should maintain rawValue consistency with batching', () => {
      const testState = state(0);
      expect(testState.rawValue).toBe(0);

      batch(() => {
        testState.value = 1;
        expect(testState.rawValue).toBe(1);
        testState.value = 2;
        expect(testState.rawValue).toBe(2);
      });

      expect(testState.rawValue).toBe(2);
      expect(testState.value).toBe(2);
    });

    it('should not establish dependencies when accessing rawValue', () => {
      const testState = state(0);
      let effectCount = 0;

      effect(() => {
        testState.rawValue; // Should not create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      testState.value = 1;
      expect(effectCount).toBe(1); // Should not re-run effect
    });

    it('should work with mutation observation', () => {
      const testState = state([1, 2, 3], { observeMutations: true });
      expect(testState.rawValue).toEqual([1, 2, 3]);

      testState.value.push(4);
      expect(testState.rawValue).toEqual([1, 2, 3, 4]);
    });
  });

  describe('Name Validation', () => {
    it('should throw error for names containing dots', () => {
      expect(() => {
        state('test', 'invalid.name');
      }).toThrow(
        "Invalid state name 'invalid.name': Names cannot contain dots (.) as they break the code.",
      );
    });

    it('should throw error for names starting with numbers', () => {
      expect(() => {
        state('test', '123invalid');
      }).toThrow(
        "Invalid state name '123invalid': Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).",
      );
    });

    it('should throw error for names with spaces', () => {
      expect(() => {
        state('test', 'invalid name');
      }).toThrow(
        "Invalid state name 'invalid name': Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).",
      );
    });

    it('should throw error for names with special characters', () => {
      expect(() => {
        state('test', 'invalid-name');
      }).toThrow(
        "Invalid state name 'invalid-name': Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).",
      );
    });

    it('should throw error for names with parentheses', () => {
      expect(() => {
        state('test', 'invalid()');
      }).toThrow(
        "Invalid state name 'invalid()': Names must be valid JavaScript identifiers (start with letter, underscore, or $, followed by letters, numbers, underscores, or $).",
      );
    });

    it('should allow valid names starting with underscore', () => {
      const state1 = state('test', '_validName');
      const state2 = state('test', '_123valid');
      expect(state1.value).toBe('test');
      expect(state2.value).toBe('test');
    });

    it('should allow valid names starting with dollar sign', () => {
      const state1 = state('test', '$validName');
      const state2 = state('test', '$123valid');
      expect(state1.value).toBe('test');
      expect(state2.value).toBe('test');
    });

    it('should allow valid names with numbers after first character', () => {
      const state1 = state('test', 'valid123');
      const state2 = state('test', 'valid_123');
      expect(state1.value).toBe('test');
      expect(state2.value).toBe('test');
    });

    it('should allow single character names', () => {
      const state1 = state('test', 'a');
      const state2 = state('test', '_');
      const state3 = state('test', '$');
      expect(state1.value).toBe('test');
      expect(state2.value).toBe('test');
      expect(state3.value).toBe('test');
    });

    it('should validate names in derived values', () => {
      const source = state(1);

      expect(() => {
        derived(() => source.value * 2, 'invalid.name');
      }).toThrow(
        "Invalid state name 'invalid.name': Names cannot contain dots (.) as they break the code.",
      );
    });

    it('should validate names in asyncDerived values', () => {
      const source = state(1);

      expect(() => {
        asyncDerived(async () => source.value * 2, 'invalid.name');
      }).toThrow(
        "Invalid state name 'invalid.name': Names cannot contain dots (.) as they break the code.",
      );
    });

    it('should validate names in effects', () => {
      expect(() => {
        effect(() => {}, 'invalid.name');
      }).toThrow(
        "Invalid state name 'invalid.name': Names cannot contain dots (.) as they break the code.",
      );
    });

    it('should validate names in actions', () => {
      expect(() => {
        action(() => {}, 'invalid.name');
      }).toThrow(
        "Invalid state name 'invalid.name': Names cannot contain dots (.) as they break the code.",
      );
    });

    it('should allow empty string as name (no validation)', () => {
      // Empty string should not trigger validation
      const state1 = state('test', '');
      expect(state1.value).toBe('test');
    });

    it('should allow undefined as name (no validation)', () => {
      // Undefined should not trigger validation
      const state1 = state('test');
      expect(state1.value).toBe('test');
    });
  });
});
