import {
  signal,
  derived,
  effect,
  batch,
  useSubscribe,
  setReact,
} from './index';

// Mock React for testing
const mockReact = {
  useSyncExternalStore: jest.fn((subscribe, getSnapshot, getServerSnapshot) => {
    // Call subscribe immediately to simulate the subscription
    const unsubscribe = subscribe(() => {});
    // Return the current snapshot
    return getSnapshot();
  }),
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

describe('Signals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic signal functionality', () => {
    it('should create a signal with initial value', () => {
      const testSignal = signal('initial');
      expect(testSignal.value).toBe('initial');
      expect(testSignal.rawValue).toBe('initial');
    });

    it('should update signal value', () => {
      const testSignal = signal('initial');
      testSignal.value = 'updated';
      expect(testSignal.value).toBe('updated');
      expect(testSignal.rawValue).toBe('updated');
    });

    it('should update signal using update method', async () => {
      const testSignal = signal(0);
      await testSignal.update((prev) => prev + 1);
      expect(testSignal.value).toBe(1);
    });

    it('should update signal using async update method', async () => {
      const testSignal = signal(0);
      await testSignal.update(async (prev) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return prev + 1;
      });
      expect(testSignal.value).toBe(1);
    });

    it('should handle multiple rapid updates', () => {
      const testSignal = signal(0);
      testSignal.value = 1;
      testSignal.value = 2;
      testSignal.value = 3;
      expect(testSignal.value).toBe(3);
    });

    it('should not update if value is the same (Object.is)', () => {
      const testSignal = signal({ count: 0 });
      const originalValue = testSignal.value;
      testSignal.value = { count: 0 }; // Same value, different object
      expect(testSignal.value).not.toBe(originalValue);

      testSignal.value = originalValue; // Same object reference
      expect(testSignal.value).toBe(originalValue);
    });
  });

  describe('Signal subscriptions', () => {
    it('should notify subscribers when value changes', () => {
      const testSignal = signal(0);
      let notified = false;

      testSignal.subscribe(() => {
        notified = true;
      });

      testSignal.value = 1;
      expect(notified).toBe(true);
    });

    it('should return unsubscribe function', () => {
      const testSignal = signal(0);
      let notificationCount = 0;

      const unsubscribe = testSignal.subscribe(() => {
        notificationCount++;
      });

      testSignal.value = 1;
      testSignal.value = 2;
      expect(notificationCount).toBe(2);

      unsubscribe();
      testSignal.value = 3;
      expect(notificationCount).toBe(2); // Should not increase
    });

    it('should handle multiple subscribers', () => {
      const testSignal = signal(0);
      let count1 = 0;
      let count2 = 0;

      testSignal.subscribe(() => count1++);
      testSignal.subscribe(() => count2++);

      testSignal.value = 1;
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });

    it('should not notify active effect', () => {
      const testSignal = signal(0);
      let effectCount = 0;

      effect(() => {
        testSignal.value; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      testSignal.value = 1;
      expect(effectCount).toBe(2);
    });
  });

  describe('useSubscribe hook', () => {
    it('should subscribe to signal changes', () => {
      const testSignal = signal('test');
      useSubscribe(testSignal);

      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();
    });

    it('should call useSyncExternalStore with proper parameters', () => {
      const testSignal = signal(0);
      useSubscribe(testSignal);

      expect(mockReact.useSyncExternalStore).toHaveBeenCalledWith(
        testSignal.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should throw error if React is not set', () => {
      // Temporarily clear React
      const originalReact = (global as any).React;
      (global as any).React = null;

      // Reset the module's React reference
      const signalsModule = require('./index');
      signalsModule.setReact(null);

      expect(() => {
        signalsModule.useSubscribe(signal(0));
      }).toThrow(
        'React not set. Call setReact(React) before using useSubscribe'
      );

      // Restore React
      (global as any).React = originalReact;
      signalsModule.setReact(mockReact);
    });

    it('should properly subscribe to signal changes', () => {
      const testSignal = signal(0);

      // Use the signal (simulates component mounting)
      useSubscribe(testSignal);

      // Verify useSyncExternalStore was called
      expect(mockReact.useSyncExternalStore).toHaveBeenCalledWith(
        testSignal.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle multiple components using the same signal independently', () => {
      const testSignal = signal(0);

      // Component 1 subscribes
      useSubscribe(testSignal);

      // Component 2 subscribes
      useSubscribe(testSignal);

      // Verify both components are subscribed
      expect(mockReact.useSyncExternalStore).toHaveBeenCalledTimes(2);

      // Verify both calls were made with the same signal
      expect(mockReact.useSyncExternalStore).toHaveBeenNthCalledWith(
        1,
        testSignal.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
      expect(mockReact.useSyncExternalStore).toHaveBeenNthCalledWith(
        2,
        testSignal.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should verify actual signal subscription works', () => {
      const testSignal = signal(0);
      let subscriptionCount = 0;

      // Track actual subscriptions
      const originalSubscribe = testSignal.subscribe;
      testSignal.subscribe = jest.fn((fn) => {
        subscriptionCount++;
        return originalSubscribe.call(testSignal, fn);
      });

      // Use the signal
      useSubscribe(testSignal);

      // Verify subscription was created
      expect(testSignal.subscribe).toHaveBeenCalledTimes(1);
      expect(subscriptionCount).toBe(1);

      // Verify useSyncExternalStore was called correctly
      expect(mockReact.useSyncExternalStore).toHaveBeenCalledWith(
        testSignal.subscribe,
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe('Pending state', () => {
    it('should track pending state during updates', async () => {
      const testSignal = signal(0);

      expect(testSignal.pending).toBe(false);

      const updatePromise = testSignal.update(async (prev) => {
        expect(testSignal.pending).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return prev + 1;
      });

      expect(testSignal.pending).toBe(true);

      await updatePromise;
      expect(testSignal.pending).toBe(false);
    });
  });

  describe('Derived values', () => {
    it('should create derived value', () => {
      const source = signal(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);
    });

    it('should update derived value when dependency changes', () => {
      const source = signal(1);
      const derivedValue = derived(() => source.value * 2);

      expect(derivedValue.value).toBe(2);

      source.value = 3;
      expect(derivedValue.value).toBe(6);
    });

    it('should handle multiple dependencies', () => {
      const a = signal(1);
      const b = signal(2);
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
      const testSignal = signal(0);
      let effectCount = 0;

      effect(() => {
        testSignal.value; // Access to create dependency
        effectCount++;
      });

      expect(effectCount).toBe(1);

      testSignal.value = 1;
      expect(effectCount).toBe(2);
    });

    it('should handle cleanup function', () => {
      const testSignal = signal(0);
      let cleanupRan = false;

      const dispose = effect(() => {
        testSignal.value;
        return () => {
          cleanupRan = true;
        };
      });

      expect(cleanupRan).toBe(false);

      testSignal.value = 1;
      expect(cleanupRan).toBe(true);

      dispose();
      expect(cleanupRan).toBe(true);
    });
  });

  describe('Batching', () => {
    it('should batch multiple updates', () => {
      const testSignal = signal(0);
      let notificationCount = 0;

      testSignal.subscribe(() => {
        notificationCount++;
      });

      batch(() => {
        testSignal.value = 1;
        testSignal.value = 2;
        testSignal.value = 3;
      });

      expect(testSignal.value).toBe(3);
      expect(notificationCount).toBe(1); // Only one notification for batched updates
    });
  });

  describe('Edge cases', () => {
    it('should handle circular dependencies gracefully', () => {
      const a = signal(1);
      const b = signal(2);

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
      const testSignal = signal(0);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      await testSignal.update(() => {
        throw new Error('Test error');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Signal update failed:',
        expect.any(Error)
      );
      expect(testSignal.value).toBe(0); // Value should remain unchanged

      consoleSpy.mockRestore();
    });
  });
});
