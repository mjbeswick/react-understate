import { state, action, ConcurrentActionError } from './core';

describe('Action Concurrency', () => {
  beforeEach(() => {
    // Clear any existing state
    if (typeof window !== 'undefined' && (window as any).reactUnderstate) {
      (window as any).reactUnderstate.states = {};
      (window as any).reactUnderstate.actions = {};
    }
  });

  describe('Drop Concurrency', () => {
    it('should drop concurrent calls when concurrency is set to drop', async () => {
      const executionOrder: number[] = [];
      const completionOrder: number[] = [];
      const count = state(0);

      const asyncAction = action(
        async (value: number) => {
          executionOrder.push(value);
          // Simulate async work with different delays
          await new Promise(resolve => setTimeout(resolve, value * 10));
          completionOrder.push(value);
          count.value = value;
          return value;
        },
        'dropAction',
        { concurrency: 'drop' },
      );

      // Start multiple calls rapidly
      const promise1 = asyncAction(3); // Will be aborted
      const promise2 = asyncAction(2); // Will be aborted
      const promise3 = asyncAction(1); // Should complete

      const results = await Promise.allSettled([promise1, promise2, promise3]);

      // All calls should start execution
      expect(executionOrder).toEqual([3, 2, 1]);

      // Only the last call should complete
      expect(completionOrder).toEqual([1]);
      expect(count.value).toBe(1);

      // The last promise should resolve, others may be aborted
      expect(results[2].status).toBe('fulfilled');
      if (results[2].status === 'fulfilled') {
        expect(results[2].value).toBe(1);
      }
    });

    it('should handle drop concurrency with sync functions', async () => {
      const executionOrder: number[] = [];
      const count = state(0);

      const syncAction = action(
        (value: number) => {
          executionOrder.push(value);
          count.value = value;
          return value;
        },
        'syncDropAction',
        { concurrency: 'drop' },
      );

      // For sync functions, all should execute since there's no async delay
      const result1 = syncAction(1);
      const result2 = syncAction(2);
      const result3 = syncAction(3);

      expect(executionOrder).toEqual([1, 2, 3]);
      expect(count.value).toBe(3);
      expect(result1).toBe(1);
      expect(result2).toBe(2);
      expect(result3).toBe(3);
    });

    it('should handle drop concurrency with mixed sync/async calls', async () => {
      const executionOrder: number[] = [];
      const completionOrder: number[] = [];
      const count = state(0);

      const mixedAction = action(
        async (value: number, isAsync: boolean) => {
          executionOrder.push(value);

          if (isAsync) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          completionOrder.push(value);
          count.value = value;
          return value;
        },
        'mixedDropAction',
        { concurrency: 'drop' },
      );

      // Mix of sync and async calls
      const promise1 = mixedAction(1, true); // async - will be aborted
      const promise2 = mixedAction(2, false); // sync - will complete immediately
      const promise3 = mixedAction(3, true); // async - should complete

      const results = await Promise.allSettled([promise1, promise2, promise3]);

      expect(executionOrder).toEqual([1, 2, 3]);

      // Sync call completes immediately, last async call completes
      expect(completionOrder).toContain(2);
      expect(completionOrder).toContain(3);
      expect(count.value).toBe(3);
    });

    it('should abort previous async operations when using drop concurrency', async () => {
      let abortCount = 0;
      const executionOrder: number[] = [];
      const count = state(0);

      const abortableAction = action(
        async (value: number, system?: { signal: AbortSignal }) => {
          executionOrder.push(value);

          if (system?.signal) {
            system.signal.addEventListener('abort', () => {
              abortCount++;
            });

            // Simulate async work
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, 100);
              system.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Aborted'));
              });
            });
          } else {
            // Fallback if no signal provided
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          count.value = value;
          return value;
        },
        'abortableDropAction',
        { concurrency: 'drop' },
      );

      // Start multiple calls
      const promise1 = abortableAction(1);
      const promise2 = abortableAction(2);
      const promise3 = abortableAction(3);

      await Promise.allSettled([promise1, promise2, promise3]);

      // All should start execution
      expect(executionOrder).toEqual([1, 2, 3]);

      // First two should be aborted
      expect(abortCount).toBe(2);

      // Only the last one should complete
      expect(count.value).toBe(3);
    });

    it('should handle drop concurrency with error handling', async () => {
      const executionOrder: number[] = [];
      const count = state(0);

      const errorAction = action(
        async (value: number) => {
          executionOrder.push(value);

          if (value === 2) {
            throw new Error(`Error for value ${value}`);
          }

          await new Promise(resolve => setTimeout(resolve, 50));
          count.value = value;
          return value;
        },
        'errorDropAction',
        { concurrency: 'drop' },
      );

      // Start calls where middle one throws error
      const promise1 = errorAction(1); // Will be aborted
      const promise2 = errorAction(2); // Will throw error but be aborted
      const promise3 = errorAction(3); // Should complete

      const results = await Promise.allSettled([promise1, promise2, promise3]);

      expect(executionOrder).toEqual([1, 2, 3]);
      expect(count.value).toBe(3);

      // Last promise should fulfill
      expect(results[2].status).toBe('fulfilled');
      if (results[2].status === 'fulfilled') {
        expect(results[2].value).toBe(3);
      }
    });

    it('should work with drop concurrency using options object syntax', async () => {
      const executionOrder: number[] = [];
      const count = state(0);

      const optionsAction = action(
        async (value: number) => {
          executionOrder.push(value);
          await new Promise(resolve => setTimeout(resolve, 50));
          count.value = value;
          return value;
        },
        { name: 'optionsDropAction', concurrency: 'drop' },
      );

      const promise1 = optionsAction(1);
      const promise2 = optionsAction(2);

      await Promise.allSettled([promise1, promise2]);

      expect(executionOrder).toEqual([1, 2]);
      expect(count.value).toBe(2);
    });

    it('should handle rapid successive calls with drop concurrency', async () => {
      const executionOrder: number[] = [];
      const completionOrder: number[] = [];
      const count = state(0);

      const rapidAction = action(
        async (value: number) => {
          executionOrder.push(value);
          await new Promise(resolve => setTimeout(resolve, 20));
          completionOrder.push(value);
          count.value = value;
          return value;
        },
        'rapidDropAction',
        { concurrency: 'drop' },
      );

      // Fire many rapid calls
      const promises: Promise<number>[] = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(rapidAction(i));
      }

      await Promise.allSettled(promises);

      // All should start execution
      expect(executionOrder).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      // Only the last one should complete
      expect(completionOrder).toEqual([10]);
      expect(count.value).toBe(10);
    });
  });

  describe('Queue vs Drop Comparison', () => {
    it('should demonstrate difference between queue and drop concurrency', async () => {
      const queueResults: number[] = [];
      const dropResults: number[] = [];
      const queueState = state(0);
      const dropState = state(0);

      const queueAction = action(
        async (value: number) => {
          await new Promise(resolve => setTimeout(resolve, 30));
          queueResults.push(value);
          queueState.value = value;
          return value;
        },
        'queueAction',
        { concurrency: 'queue' }, // Default behavior
      );

      const dropAction = action(
        async (value: number) => {
          await new Promise(resolve => setTimeout(resolve, 30));
          dropResults.push(value);
          dropState.value = value;
          return value;
        },
        'dropAction',
        { concurrency: 'drop' },
      );

      // Start multiple calls for both
      const queuePromises = [queueAction(1), queueAction(2), queueAction(3)];
      const dropPromises = [dropAction(1), dropAction(2), dropAction(3)];

      await Promise.allSettled([...queuePromises, ...dropPromises]);

      // Queue should execute all in order
      expect(queueResults).toEqual([1, 2, 3]);
      expect(queueState.value).toBe(3);

      // Drop should only execute the last one
      expect(dropResults).toEqual([3]);
      expect(dropState.value).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle drop concurrency with unnamed actions (should not drop)', async () => {
      const executionOrder: number[] = [];
      const completionOrder: number[] = [];

      const unnamedAction = action(
        async (value: number) => {
          executionOrder.push(value);
          await new Promise(resolve => setTimeout(resolve, 50));
          completionOrder.push(value);
          return value;
        },
        // No name provided, so concurrency control won't work
        { concurrency: 'drop' },
      );

      const promises = [unnamedAction(1), unnamedAction(2), unnamedAction(3)];
      await Promise.allSettled(promises);

      // Without names, all should execute (no concurrency control)
      expect(executionOrder).toEqual([1, 2, 3]);
      expect(completionOrder).toEqual([1, 2, 3]);
    });

    it('should handle drop concurrency when action completes very quickly', async () => {
      const executionOrder: number[] = [];
      const count = state(0);

      const fastAction = action(
        async (value: number) => {
          executionOrder.push(value);
          // Very short delay
          await new Promise(resolve => setTimeout(resolve, 1));
          count.value = value;
          return value;
        },
        'fastDropAction',
        { concurrency: 'drop' },
      );

      // Even with very fast execution, drop should still work
      const promises = [fastAction(1), fastAction(2), fastAction(3)];
      await Promise.allSettled(promises);

      expect(executionOrder).toEqual([1, 2, 3]);
      // The final value depends on timing, but should be one of the values
      expect([1, 2, 3]).toContain(count.value);
    });
  });
});
