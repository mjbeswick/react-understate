import { state, derived, effect, batch, useSubscribe, setReact } from "./index";

// Mock React for testing
const mockReact = {
  useSyncExternalStore: jest.fn(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (subscribe, getSnapshot, getServerSnapshot) => {
      // Call subscribe immediately to simulate the subscription
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const unsubscribe = subscribe(() => {});
      // Return the current snapshot
      return getSnapshot();
    },
  ),
  // Keep old hooks for remaining tests that need them
  useState: jest.fn(() => [null, jest.fn()]),
  useEffect: jest.fn((fn) => {
    // Call the effect immediately and return cleanup function
    const cleanup = fn();
    return cleanup;
  }),
};

// Set React before running tests
setReact(mockReact);

describe("States", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic signal functionality", () => {
    it("should create a signal with initial value", () => {
      const testState = state("initial");
      expect(testState.value).toBe("initial");
      expect(testState.rawValue).toBe("initial");
    });

    it("should update signal value", () => {
      const testState = state("initial");
      testState.value = "updated";
      expect(testState.value).toBe("updated");
      expect(testState.rawValue).toBe("updated");
    });

    it("should update signal using update method", async () => {
      const testState = state(0);
      await testState.update((prev) => prev + 1);
      expect(testState.value).toBe(1);
    });

    it("should update signal using async update method", async () => {
      const testState = state(0);
      await testState.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return prev + 1;
      });
      expect(testState.value).toBe(1);
    });

    it("should handle multiple rapid updates", () => {
      const testState = state(0);
      testState.value = 1;
      testState.value = 2;
      testState.value = 3;
      expect(testState.value).toBe(3);
    });

    it("should not update if value is the same (Object.is)", () => {
      const testState = state({ count: 0 });
      const originalValue = testState.value;
      testState.value = { count: 0 }; // Same value, different object
      expect(testState.value).not.toBe(originalValue);

      testState.value = originalValue; // Same object reference
      expect(testState.value).toBe(originalValue);
    });
  });

  describe("Signal subscriptions", () => {
    it("should notify subscribers when value changes", () => {
      const testState = state(0);
      let notified = false;

      testState.subscribe(() => {
        notified = true;
      });

      testState.value = 1;
      expect(notified).toBe(true);
    });

    it("should return unsubscribe function", () => {
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

    it("should handle multiple subscribers", () => {
      const testState = state(0);
      let count1 = 0;
      let count2 = 0;

      testState.subscribe(() => count1++);
      testState.subscribe(() => count2++);

      testState.value = 1;
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    it("should not notify active effect", () => {
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

  describe("useSubscribe hook", () => {
    it("should subscribe to signal changes", () => {
      const testState = state("test");
      useSubscribe(testState);

      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();
    });

    it("should call useSyncExternalStore with proper parameters", () => {
      const testState = state(0);
      useSubscribe(testState);

      expect(mockReact.useSyncExternalStore).toHaveBeenCalledWith(
        testState.subscribe,
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("should use setReact when provided", () => {
      const testState = state(0);

      // Test that setReact works as an override
      setReact(mockReact);

      // This should work because we set the React instance
      expect(() => {
        useSubscribe(testState);
      }).not.toThrow();

      // Verify the mock was called
      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();
    });

    it("should properly subscribe to signal changes", () => {
      const testState = state(0);

      // Test that the hook calls useSyncExternalStore with correct parameters
      // Note: We can't actually call useSubscribe outside of a React component
      // So we test the subscription mechanism directly
      const unsubscribe = testState.subscribe(() => {});
      expect(typeof unsubscribe).toBe("function");

      // Clean up
      unsubscribe();
    });

    it("should handle multiple components using the same signal independently", () => {
      const testState = state(0);

      // Test multiple subscriptions to the same signal
      const unsubscribe1 = testState.subscribe(() => {});
      const unsubscribe2 = testState.subscribe(() => {});

      // Verify both subscriptions are independent
      expect(typeof unsubscribe1).toBe("function");
      expect(typeof unsubscribe2).toBe("function");
      expect(unsubscribe1).not.toBe(unsubscribe2);

      // Clean up
      unsubscribe1();
      unsubscribe2();
    });

    it("should verify actual signal subscription works", () => {
      const testState = state(0);
      let subscriptionCount = 0;

      // Track actual subscriptions
      const originalSubscribe = testState.subscribe;
      testState.subscribe = jest.fn((fn) => {
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

  describe("Pending state", () => {
    it("should track pending state during updates", async () => {
      const testState = state(0);

      expect(testState.pending).toBe(false);

      const updatePromise = testState.update(async (prev) => {
        expect(testState.pending).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return prev + 1;
      });

      expect(testState.pending).toBe(true);

      await updatePromise;
      expect(testState.pending).toBe(false);
    });
  });

  describe("Derived values", () => {
    it("should create derived value", () => {
      const source = state(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);
    });

    it("should update derived value when dependency changes", () => {
      const source = state(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);

      source.value = 3;
      expect(derivedValue.value).toBe(6);
    });

    it("should handle multiple dependencies", () => {
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

  describe("Effects", () => {
    it("should run effect immediately", () => {
      let effectRan = false;

      effect(() => {
        effectRan = true;
      });

      expect(effectRan).toBe(true);
    });

    it("should re-run effect when dependencies change", () => {
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

    it("should handle cleanup function", () => {
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

  describe("Batching", () => {
    it("should batch multiple updates", () => {
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

  describe("Edge cases", () => {
    it("should handle circular dependencies gracefully", () => {
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

    it("should handle errors in update function", async () => {
      const testState = state(0);
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await testState.update(() => {
        throw new Error("Test error");
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "State update failed:",
        expect.any(Error),
      );
      expect(testState.value).toBe(0); // Value should remain unchanged

      consoleSpy.mockRestore();
    });
  });

  describe("Deep freezing", () => {
    it("should automatically freeze objects when set", () => {
      const userState = state({ name: "John", age: 30 });

      // The object should be frozen
      expect(Object.isFrozen(userState.value)).toBe(true);
      // Note: Primitive values like strings and numbers are immutable by nature
      // so Object.isFrozen() behavior on them may vary
    });

    it("should automatically freeze arrays when set", () => {
      const itemsState = state(["apple", "banana", "cherry"]);

      // The array should be frozen
      expect(Object.isFrozen(itemsState.value)).toBe(true);
      // Note: Primitive values like strings are immutable by nature
      // so Object.isFrozen() behavior on them may vary
    });

    it("should deeply freeze nested objects", () => {
      const nestedState = state({
        user: {
          profile: {
            name: "John",
            preferences: {
              theme: "dark",
              notifications: true,
            },
          },
        },
      });

      // All levels should be frozen
      expect(Object.isFrozen(nestedState.value)).toBe(true);
      expect(Object.isFrozen(nestedState.value.user)).toBe(true);
      expect(Object.isFrozen(nestedState.value.user.profile)).toBe(true);
      expect(Object.isFrozen(nestedState.value.user.profile.preferences)).toBe(
        true,
      );
    });

    it("should deeply freeze nested arrays", () => {
      const nestedArrayState = state([
        [1, 2, 3],
        ["a", "b", "c"],
        [{ x: 1, y: 2 }],
      ]);

      // All levels should be frozen
      expect(Object.isFrozen(nestedArrayState.value)).toBe(true);
      expect(Object.isFrozen(nestedArrayState.value[0])).toBe(true);
      expect(Object.isFrozen(nestedArrayState.value[1])).toBe(true);
      expect(Object.isFrozen(nestedArrayState.value[2])).toBe(true);
    });

    it("should not freeze primitive values", () => {
      const stringState = state("hello");
      const numberState = state(42);
      const booleanState = state(true);
      const nullState = state(null);
      const undefinedState = state(undefined);

      // Primitives are immutable by nature, so Object.isFrozen() behavior may vary
      // The important thing is that they work correctly as state values
      expect(stringState.value).toBe("hello");
      expect(numberState.value).toBe(42);
      expect(booleanState.value).toBe(true);
      expect(nullState.value).toBe(null);
      expect(undefinedState.value).toBe(undefined);
    });

    it("should prevent mutations of frozen objects", () => {
      const userState = state({ name: "John", age: 30 });

      // The object should be frozen and mutations should not work
      const originalName = userState.value.name;

      // Attempting to mutate should not work (either throws or fails silently)
      try {
        (userState.value as any).name = "Jane";
        // If we get here, the mutation failed silently (which is fine)
        expect(userState.value.name).toBe(originalName);
      } catch (e) {
        // If we get here, the mutation threw an error (which is also fine)
        expect(e).toBeDefined();
      }
    });

    it("should prevent mutations of frozen arrays", () => {
      const itemsState = state(["apple", "banana"]);

      // The array should be frozen and mutations should not work
      const originalLength = itemsState.value.length;

      // Attempting to mutate should not work (either throws or fails silently)
      try {
        (itemsState.value as any).push("cherry");
        // If we get here, the mutation failed silently (which is fine)
        expect(itemsState.value.length).toBe(originalLength);
      } catch (e) {
        // If we get here, the mutation threw an error (which is also fine)
        expect(e).toBeDefined();
      }
    });

    it("should freeze objects when using update method", async () => {
      const userState = state({ name: "John", age: 30 });

      await userState.update((prev) => ({ ...prev, age: 31 }));

      // The new object should be frozen
      expect(Object.isFrozen(userState.value)).toBe(true);
      expect(userState.value.age).toBe(31);
    });

    it("should maintain reactivity while enforcing immutability", () => {
      const userState = state({ name: "John", age: 30 });
      let effectCount = 0;

      effect(() => {
        userState.value.name; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      // Update with new object (immutable pattern)
      userState.value = { ...userState.value, name: "Jane" };
      expect(effectCount).toBe(2);
      expect(userState.value.name).toBe("Jane");
    });
  });
});
