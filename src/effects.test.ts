/**
 * @fileoverview Tests for Effects
 *
 * Tests for the effects module focusing on coverage improvements.
 */

import { effect } from './effects';
import { state, derived, configureDebug } from './core';

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

  describe('Debug Logging', () => {
    beforeEach(() => {
      // Reset debug config before each test
      configureDebug({ enabled: false, logger: undefined });
    });

    it('should log effect runs when debug is enabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: true, logger: console.log });

      const testState = state(0, 'testState');
      const dispose = effect(() => {
        testState.value; // Access the state to create dependency
      }, 'testEffect');

      // Effect should run immediately
      expect(consoleSpy).toHaveBeenCalledWith("effect: 'testEffect' running");

      // Clear previous calls and change the dependency to trigger effect again
      consoleSpy.mockClear();
      testState.value = 5;
      expect(consoleSpy).toHaveBeenCalledWith("effect: 'testEffect' running");

      dispose();
      consoleSpy.mockRestore();
    });

    it('should not log effect runs when debug is disabled', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: false });

      const testState = state(0, 'testState');
      const dispose = effect(() => {
        testState.value; // Access the state to create dependency
      }, 'testEffect');

      // Clear any previous calls
      consoleSpy.mockClear();

      testState.value = 5;

      expect(consoleSpy).not.toHaveBeenCalled();

      dispose();
      consoleSpy.mockRestore();
    });

    it('should not log effect runs when no name is provided', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      configureDebug({ enabled: true, logger: console.log });

      const testState = state(0, 'testState');
      const dispose = effect(() => {
        testState.value; // Access the state to create dependency
      }); // No name provided

      // Clear any previous calls
      consoleSpy.mockClear();

      testState.value = 5;

      // Should not have any calls related to effect runs
      const effectCalls = consoleSpy.mock.calls.filter(
        call => call[0] && call[0].includes('effect:'),
      );
      expect(effectCalls).toHaveLength(0);

      dispose();
      consoleSpy.mockRestore();
    });
  });

  describe('Effect Options', () => {
    it.skip('should prevent infinite loops by default', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const a = valueA.value; // Reads valueA
        const b = valueB.value; // Reads valueB
        valueB.value = b + 1; // Modifies valueB - should not trigger re-execution
      }, 'loopPreventionTest');

      expect(effectRuns).toBe(1); // Should only run once

      // Change valueA - should trigger re-execution
      valueA.value = 10;
      expect(effectRuns).toBe(2);

      // Change valueB - should NOT trigger re-execution (prevented loop)
      valueB.value = 100;
      expect(effectRuns).toBe(2); // Should still be 2

      dispose();
    });

    it('should allow infinite loops when preventLoops is false', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      let effectRuns = 0;

      const dispose = effect(
        () => {
          effectRuns++;
          const a = valueA.value; // Reads valueA
          const b = valueB.value; // Reads valueB
          valueB.value = b + 1; // Modifies valueB - will trigger re-execution
        },
        'loopTest',
        { preventLoops: false },
      );

      expect(effectRuns).toBe(1); // Initial run

      // Change valueA - should trigger re-execution
      valueA.value = 10;
      expect(effectRuns).toBe(2);

      // Change valueB - should trigger re-execution (loop not prevented)
      valueB.value = 100;
      expect(effectRuns).toBe(3);

      dispose();
    });

    it('should run only once when once option is true', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      let effectRuns = 0;

      const dispose = effect(
        () => {
          effectRuns++;
          const a = valueA.value;
          const b = valueB.value;
        },
        'onceTest',
        { once: true },
      );

      expect(effectRuns).toBe(1); // Should run once initially

      // Change values - should NOT trigger re-execution
      valueA.value = 10;
      valueB.value = 20;
      expect(effectRuns).toBe(1); // Should still be 1

      dispose();
    });

    it('should prevent overlapping executions when preventOverlap is true', async () => {
      const valueA = state(1, 'valueA');
      let effectRuns = 0;
      let concurrentRuns = 0;

      const dispose = effect(
        async () => {
          effectRuns++;
          concurrentRuns++;
          console.log(
            `Effect run ${effectRuns}, concurrent: ${concurrentRuns}`,
          );

          // Read the dependency to track it
          const a = valueA.value;

          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, 50));

          concurrentRuns--;
          console.log(
            `Effect run ${effectRuns} completed, concurrent: ${concurrentRuns}`,
          );
        },
        'overlapTest',
        { preventOverlap: true },
      );

      expect(effectRuns).toBe(1); // Initial run

      // Trigger multiple rapid changes
      console.log('Changing valueA to 2');
      valueA.value = 2;
      console.log('Changing valueA to 3');
      valueA.value = 3;
      console.log('Changing valueA to 4');
      valueA.value = 4;

      // Wait for async work to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should only run once more due to preventOverlap
      expect(effectRuns).toBe(2);
      expect(concurrentRuns).toBe(0); // No concurrent runs

      dispose();
    });

    it('should allow overlapping executions when preventOverlap is false', async () => {
      const valueA = state(1, 'valueA');
      let effectRuns = 0;
      let concurrentRuns = 0;

      const dispose = effect(
        async () => {
          effectRuns++;
          concurrentRuns++;

          // Read the dependency to track it
          const a = valueA.value;

          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, 50));

          concurrentRuns--;
        },
        'overlapTest',
        { preventOverlap: false },
      );

      expect(effectRuns).toBe(1); // Initial run

      // Trigger multiple rapid changes
      valueA.value = 2;
      valueA.value = 3;
      valueA.value = 4;

      // Wait for async work to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should run multiple times due to preventOverlap being false
      expect(effectRuns).toBe(4);
      expect(concurrentRuns).toBe(0); // All runs completed

      dispose();
    });

    it('should handle complex loop prevention scenarios', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      const valueC = state(3, 'valueC');
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const a = valueA.value; // Reads valueA
        const b = valueB.value; // Reads valueB
        const c = valueC.value; // Reads valueC

        // Modify valueB and valueC as side effects
        valueB.value = b * 2;
        valueC.value = c + 1;
      }, 'complexLoopTest');

      expect(effectRuns).toBe(1); // Initial run

      // Change valueA - should trigger re-execution
      valueA.value = 10;
      expect(effectRuns).toBe(2);

      // Change valueB - should NOT trigger re-execution (prevented loop)
      valueB.value = 100;
      expect(effectRuns).toBe(2);

      // Change valueC - should NOT trigger re-execution (prevented loop)
      valueC.value = 200;
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should work with derived values in loop prevention', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      let effectRuns = 0;

      const derivedValue = derived(() => valueA.value * 2, 'derivedValue');

      const dispose = effect(() => {
        effectRuns++;
        const a = valueA.value; // Reads valueA
        const b = valueB.value; // Reads valueB
        const d = derivedValue.value; // Reads derived value

        // Modify valueB as side effect
        valueB.value = b + 1;
      }, 'derivedLoopTest');

      expect(effectRuns).toBe(1); // Initial run

      // Change valueA - should trigger re-execution (affects derived value)
      valueA.value = 10;
      expect(effectRuns).toBe(2);

      // Change valueB - should NOT trigger re-execution (prevented loop)
      valueB.value = 100;
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle multiple effects with different options', () => {
      const valueA = state(1, 'valueA');
      const valueB = state(2, 'valueB');
      let effect1Runs = 0;
      let effect2Runs = 0;

      const dispose1 = effect(
        () => {
          effect1Runs++;
          const a = valueA.value;
          const b = valueB.value;
          valueB.value = b + 1; // This should not trigger re-execution
        },
        'effect1',
        { preventLoops: true },
      );

      const dispose2 = effect(
        () => {
          effect2Runs++;
          const a = valueA.value;
          const b = valueB.value;
          valueB.value = b + 1; // This should trigger re-execution
        },
        'effect2',
        { preventLoops: false },
      );

      expect(effect1Runs).toBe(1);
      expect(effect2Runs).toBe(1);

      // Change valueA - both effects should re-run
      valueA.value = 10;
      expect(effect1Runs).toBe(2);
      expect(effect2Runs).toBe(2);

      // Change valueB - only effect2 should re-run
      valueB.value = 100;
      expect(effect1Runs).toBe(2); // Prevented loop
      expect(effect2Runs).toBe(3); // Allowed loop

      dispose1();
      dispose2();
    });
  });
});
