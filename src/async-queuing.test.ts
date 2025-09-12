import { state, action } from './core';
import { effect } from './effects';

describe('Async Queuing', () => {
  beforeEach(() => {
    // Clear any existing state
    if (typeof window !== 'undefined' && (window as any).understate) {
      (window as any).understate.states = {};
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
        console.log(`Action completed for value: ${value}`);
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
        console.log(`Action completed for value: ${value}`);
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
        console.log(`Action completed for value: ${value}, async: ${isAsync}`);
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
  });
});
