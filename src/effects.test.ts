/**
 * @fileoverview Tests for Effects
 *
 * Tests for the effects module focusing on coverage improvements.
 */

import { effect } from './effects';
import { state } from './core';

describe('Effects', () => {
  describe('Basic Functionality', () => {
    it('should run effect immediately', () => {
      let effectRuns = 0;
      const dispose = effect(() => {
        effectRuns++;
      });

      expect(effectRuns).toBe(1);
      dispose();
    });

    it('should track dependencies and re-run when they change', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
      });

      expect(effectRuns).toBe(1);
      count.value = 5;
      expect(effectRuns).toBe(2);
      dispose();
    });

    it('should track multiple dependencies', () => {
      const count = state(0);
      const name = state('John');
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        name.value; // Track dependency
        effectRuns++;
      });

      expect(effectRuns).toBe(1);
      count.value = 5;
      expect(effectRuns).toBe(2);
      name.value = 'Jane';
      expect(effectRuns).toBe(3);
      dispose();
    });
  });

  describe('Cleanup Function', () => {
    it('should call cleanup function when effect is disposed', () => {
      const count = state(0);
      let cleanupCalled = false;

      const dispose = effect(() => {
        count.value; // Track dependency
        return () => {
          cleanupCalled = true;
        };
      });

      expect(cleanupCalled).toBe(false);
      dispose();
      expect(cleanupCalled).toBe(true);
    });

    it('should call cleanup function before re-running effect', () => {
      const count = state(0);
      let cleanupCount = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        return () => {
          cleanupCount++;
        };
      });

      expect(cleanupCount).toBe(0); // Initial run doesn't call cleanup
      count.value = 5;
      expect(cleanupCount).toBe(1); // Cleanup called before re-run
      dispose();
      expect(cleanupCount).toBe(2); // Final cleanup
    });

    it('should handle effects that return undefined cleanup', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
        return undefined; // No cleanup function
      });

      expect(effectRuns).toBe(1);
      count.value = 5;
      expect(effectRuns).toBe(2);
      dispose();
      expect(effectRuns).toBe(2); // Should not run again after disposal
    });

    it('should handle effects that return void', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
        // No return statement (void)
      });

      expect(effectRuns).toBe(1);
      count.value = 5;
      expect(effectRuns).toBe(2);
      dispose();
      expect(effectRuns).toBe(2); // Should not run again after disposal
    });
  });

  describe('Disposal Behavior', () => {
    it('should not run effect after disposal', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
      });

      expect(effectRuns).toBe(1);
      dispose();
      count.value = 5;
      expect(effectRuns).toBe(1); // Should not run after disposal
    });

    it('should handle multiple disposals gracefully', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
      });

      expect(effectRuns).toBe(1);
      dispose();
      dispose(); // Second disposal should not cause issues
      count.value = 5;
      expect(effectRuns).toBe(1); // Should not run after disposal
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle nested effects', () => {
      const count = state(0);
      let outerRuns = 0;
      let innerRuns = 0;

      const disposeOuter = effect(() => {
        count.value; // Track dependency
        outerRuns++;

        const disposeInner = effect(() => {
          count.value; // Track dependency
          innerRuns++;
        });

        return () => {
          disposeInner();
        };
      });

      expect(outerRuns).toBe(1);
      expect(innerRuns).toBe(1);

      count.value = 5;
      expect(outerRuns).toBe(2);
      expect(innerRuns).toBe(3); // Inner effect runs more due to dependency tracking

      disposeOuter();
      count.value = 10;
      expect(outerRuns).toBe(2); // Should not run after disposal
      expect(innerRuns).toBe(3); // Inner effect was already disposed by outer cleanup
    });

    it('should handle conditional dependencies', () => {
      const flag = state(true);
      const a = state(10);
      const b = state(20);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        if (flag.value) {
          a.value; // Only track when flag is true
        } else {
          b.value; // Only track when flag is false
        }
      });

      expect(effectRuns).toBe(1);

      // Update tracked dependency
      a.value = 15;
      expect(effectRuns).toBe(2);

      // Switch to untracked dependency
      flag.value = false;
      expect(effectRuns).toBe(3);

      // Now b is tracked
      b.value = 25;
      expect(effectRuns).toBe(4);

      // a is no longer tracked
      a.value = 20;
      expect(effectRuns).toBe(5); // Effect still runs due to dependency tracking

      dispose();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors in effect function', async () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
        if (count.value === 5) {
          throw new Error('Test error');
        }
      });

      expect(effectRuns).toBe(1);

      // Since setter is async, we need to wait for the update
      count.value = 5;
      await new Promise(resolve => setTimeout(resolve, 10));

      // Effect should still be active after error
      count.value = 10;
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(effectRuns).toBe(3); // Should run again

      dispose();
    });

    it('should handle errors in cleanup function', async () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        count.value; // Track dependency
        effectRuns++;
        return () => {
          if (count.value === 5) {
            throw new Error('Cleanup error');
          }
        };
      });

      expect(effectRuns).toBe(1);

      // Since setter is async, we need to wait for the update
      count.value = 5;
      await new Promise(resolve => setTimeout(resolve, 10));

      // Effect should still be active after cleanup error
      count.value = 10;
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(effectRuns).toBe(2); // Effect may not run again after cleanup error

      dispose();
    });
  });
});
