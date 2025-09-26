import { state, action, ConcurrentActionError } from './core';
import { effect } from './effects';

describe('Async Queuing', () => {
  beforeEach(() => {
    // Clear any existing state
    if (typeof window !== 'undefined' && (window as any).reactUnderstate) {
      (window as any).reactUnderstate.states = {};
      (window as any).reactUnderstate.actions = {};
    }
  });

  // Note: Effect queuing is not implemented as effects are reactive and
  // should not be called manually. Only action queuing is implemented.

  describe('Action Queuing', () => {
    it('should queue async action calls with the same name', async () => {
      const count = state(0);
      const results: number[] = [];

      const asyncAction = action(async (value: number) => {
        results.push(value);

        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 50));

        count.value = value;
        return value;
      }, 'asyncAction');

      // Call multiple times rapidly
      const promises = [asyncAction(1), asyncAction(2), asyncAction(3)];

      // Wait for all promises to resolve
      const results2 = await Promise.all(promises);

      // Results should be in order: 1, 2, 3
      expect(results).toEqual([1, 2, 3]);
      expect(results2).toEqual([1, 2, 3]);
      expect(count.value).toBe(3); // Final value should be 3

      asyncAction(4);
    });

    it('should not queue actions without names', async () => {
      const count = state(0);
      const results: number[] = [];

      const asyncAction = action(async (value: number) => {
        results.push(value);

        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 50));

        count.value = value;
        return value;
      }); // No name provided

      // Call multiple times rapidly
      const promises = [asyncAction(1), asyncAction(2), asyncAction(3)];

      // Wait for all promises to resolve
      const results2 = await Promise.all(promises);

      // Results should be in order: 1, 2, 3 (but may overlap)
      expect(results).toEqual([1, 2, 3]);
      expect(results2).toEqual([1, 2, 3]);
      expect(count.value).toBe(3); // Final value should be 3

      asyncAction(4);
    });

    it('should handle mixed sync and async actions', async () => {
      const count = state(0);
      const results: number[] = [];

      const mixedAction = action(async (value: number, isAsync: boolean) => {
        results.push(value);

        if (isAsync) {
          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        count.value = value;
        return value;
      }, 'mixedAction');

      // Call with mixed sync and async
      const promises = [
        mixedAction(1, true), // async
        mixedAction(2, false), // sync
        mixedAction(3, true), // async
      ];

      // Wait for all promises to resolve
      const results2 = await Promise.all(promises);

      // Results should be in order: 1, 2, 3
      expect(results).toEqual([1, 2, 3]);
      expect(results2).toEqual([1, 2, 3]);
      expect(count.value).toBe(3); // Final value should be 3

      mixedAction(4, false);
    });

    it('should abort previous call when concurrency is set to drop', async () => {
      const count = state(0);
      const calls: number[] = [];

      const asyncAction = action(
        async (value: number) => {
          calls.push(value);
          await new Promise(resolve => setTimeout(resolve, 50));
          count.value = value;
          return value;
        },
        'asyncDropAction',
        { concurrency: 'drop' },
      );

      const first = asyncAction(1);
      const second = asyncAction(2);

      await Promise.allSettled([first, second]);
      // First should be aborted before completion; second should proceed
      expect(calls).toEqual([1, 2]);
      expect(count.value).toBe(2);
    });

    it('should handle drop concurrency with multiple rapid calls', async () => {
      const count = state(0);
      const startedCalls: number[] = [];
      const completedCalls: number[] = [];

      const rapidDropAction = action(
        async (value: number) => {
          startedCalls.push(value);
          await new Promise(resolve => setTimeout(resolve, 100));
          completedCalls.push(value);
          count.value = value;
          return value;
        },
        'rapidDropAction',
        { concurrency: 'drop' },
      );

      // Fire 5 rapid calls
      const promises = [
        rapidDropAction(1),
        rapidDropAction(2),
        rapidDropAction(3),
        rapidDropAction(4),
        rapidDropAction(5),
      ];

      await Promise.allSettled(promises);

      // All calls should start
      expect(startedCalls).toEqual([1, 2, 3, 4, 5]);

      // Only the last call should complete
      expect(completedCalls).toEqual([5]);
      expect(count.value).toBe(5);
    });

    it('should work with drop concurrency using object syntax for options', async () => {
      const count = state(0);
      const calls: number[] = [];

      const objectSyntaxAction = action(
        async (value: number) => {
          calls.push(value);
          await new Promise(resolve => setTimeout(resolve, 50));
          count.value = value;
          return value;
        },
        { name: 'objectSyntaxDropAction', concurrency: 'drop' },
      );

      const first = objectSyntaxAction(10);
      const second = objectSyntaxAction(20);

      await Promise.allSettled([first, second]);

      expect(calls).toEqual([10, 20]);
      expect(count.value).toBe(20);
    });
  });
});
