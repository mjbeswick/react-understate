/**
 * @fileoverview Tests for async functionality
 */

import { state, derived, asyncDerived, effect, configureDebug } from './index';

describe('Async Functionality', () => {
  beforeEach(() => {
    configureDebug({ enabled: false });
  });

  describe('State with async setters', () => {
    it('should handle async setter functions', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      configureDebug({ enabled: true, logger: console.log });

      const count = state(0, 'count');

      // Test async setter
      count.value = async prev => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return prev + 1;
      };

      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(count.value).toBe(1);
      expect(consoleSpy).toHaveBeenCalledWith("state: 'count' 1");

      consoleSpy.mockRestore();
    });

    it('should handle async update function', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      configureDebug({ enabled: true, logger: console.log });

      const count = state(0, 'count');

      // Test async update
      await count.update(async prev => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return prev + 5;
      });

      expect(count.value).toBe(5);
      expect(consoleSpy).toHaveBeenCalledWith("state: 'count' 5");

      consoleSpy.mockRestore();
    });
  });

  describe('Effect with async functions', () => {
    it('should handle async effect functions', async () => {
      configureDebug({ enabled: true, logger: console.log });

      const count = state(0, 'count');
      let effectRunCount = 0;

      const dispose = effect(async () => {
        effectRunCount++;
        await new Promise(resolve => setTimeout(resolve, 10));
        // no-op
      }, 'asyncEffect');

      // Wait for initial effect to run
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(effectRunCount).toBe(1);

      // Trigger effect again
      count.value = 1;
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(effectRunCount).toBe(2);

      dispose();
    });

    it('should handle async effect with cleanup', async () => {
      configureDebug({ enabled: true, logger: console.log });

      const count = state(0, 'count');
      let cleanupCount = 0;

      const dispose = effect(async () => {
        // no-op
        await new Promise(resolve => setTimeout(resolve, 10));
        return () => {
          cleanupCount++;
          // no-op
        };
      }, 'asyncEffectWithCleanup');

      // Wait for initial effect
      await new Promise(resolve => setTimeout(resolve, 20));

      // Trigger effect again to test cleanup
      count.value = 1;
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(cleanupCount).toBe(1);

      dispose();
    });
  });

  describe('AsyncDerived', () => {
    it('should handle async derived values', async () => {
      configureDebug({ enabled: true, logger: console.log });

      const userId = state(1, 'userId');
      const userData = asyncDerived(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { id: userId.value, name: `User ${userId.value}` };
      }, 'userData');

      // Wait for initial computation
      await new Promise(resolve => setTimeout(resolve, 20));

      const data = await userData.value;
      expect(data).toEqual({ id: 1, name: 'User 1' });
    });

    it('should recompute when dependencies change', async () => {
      const userId = state(1, 'userId');
      const userData = asyncDerived(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { id: userId.value, name: `User ${userId.value}` };
      }, 'userData');

      // Wait for initial computation
      await new Promise(resolve => setTimeout(resolve, 20));

      // Change dependency
      userId.value = 2;
      await new Promise(resolve => setTimeout(resolve, 50));

      const data = await userData.value;
      expect(data).toEqual({ id: 2, name: 'User 2' });
    });

    it('should throw error when trying to update async derived', async () => {
      const userId = state(1, 'userId');
      const userData = asyncDerived(async () => {
        return { id: userId.value, name: `User ${userId.value}` };
      }, 'userData');

      await expect(
        userData.update(async () => ({ id: 999, name: 'Test' })),
      ).rejects.toThrow(
        'Cannot update async derived values directly - they are computed from dependencies',
      );
    });
  });

  describe('Regular derived with async functions', () => {
    it('should handle async functions in regular derived (returns Promise)', () => {
      const count = state(0, 'count');

      // This should work - derived can return a Promise
      const asyncResult = derived(() => {
        return Promise.resolve(count.value * 2);
      }, 'asyncResult');

      // The value will be a Promise
      expect(asyncResult.value).toBeInstanceOf(Promise);
    });
  });
});
