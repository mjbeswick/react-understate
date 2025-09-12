import { state, batch, action } from './core';
import { effect } from './effects';

describe('Batching Fix', () => {
  beforeEach(() => {
    // Clear any existing state
    if (typeof window !== 'undefined' && (window as any).reactUnderstate) {
      (window as any).reactUnderstate.states = {};
      (window as any).reactUnderstate.actions = {};
    }
  });

  describe('Nested Batching Scenarios', () => {
    it('should handle nested batch calls correctly', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      // Test nested batching
      batch(() => {
        count.value = 1;
        batch(() => {
          count.value = 2;
          count.value = 3;
        }, 'nestedBatch');
        count.value = 4;
      }, 'outerBatch');

      // Should only run once more after the entire batch completes
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle action calling action (nested batching)', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      // Create actions that call each other
      const actionA = action(() => {
        count.value = 1;
        actionB(); // This creates nested batching!
        count.value = 2;
      }, 'actionA');

      const actionB = action(() => {
        count.value = 3;
        count.value = 4;
      }, 'actionB');

      actionA();

      // Should only run once more after the entire action completes
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle multiple levels of nested actions', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      // Create a chain of actions
      const actionC = action(() => {
        count.value = 3;
      }, 'actionC');

      const actionB = action(() => {
        count.value = 2;
        actionC(); // Nested action
        count.value = 4;
      }, 'actionB');

      const actionA = action(() => {
        count.value = 1;
        actionB(); // Nested action
        count.value = 5;
      }, 'actionA');

      actionA();

      // Should only run once more after the entire chain completes
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle batch calling action', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      const updateCount = action(() => {
        count.value = 1;
        count.value = 2;
      }, 'updateCount');

      // Call action from within a batch
      batch(() => {
        count.value = 3;
        updateCount(); // This creates nested batching
        count.value = 4;
      }, 'testBatch');

      // Should only run once more after the entire batch completes
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle action calling batch', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      const updateCount = action(() => {
        count.value = 1;
        batch(() => {
          count.value = 2;
          count.value = 3;
        }, 'nestedBatch');
        count.value = 4;
      }, 'updateCount');

      updateCount();

      // Should only run once more after the entire action completes
      expect(effectRuns).toBe(2);

      dispose();
    });

    it('should handle complex nested scenarios', () => {
      const count = state(0);
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);

      const actionC = action(() => {
        count.value = 3;
      }, 'actionC');

      const actionB = action(() => {
        count.value = 2;
        batch(() => {
          count.value = 4;
          actionC(); // Action inside batch
          count.value = 5;
        }, 'nestedBatch');
        count.value = 6;
      }, 'actionB');

      const actionA = action(() => {
        count.value = 1;
        actionB(); // Action calling action with batch
        count.value = 7;
      }, 'actionA');

      actionA();

      // Should only run once more after the entire complex chain completes
      expect(effectRuns).toBe(2);

      dispose();
    });
  });

  describe('Effect Batching', () => {
    it('should automatically batch state updates within effects', () => {
      const count = state(0);
      const name = state('John');
      let effectRuns = 0;

      const dispose = effect(() => {
        effectRuns++;
        const _ = count.value; // Track dependency

        // Update other states (not the one we depend on)
        if (count.value > 0) {
          name.value = 'Jane';
        }
      }, 'testEffect');

      // Initial run
      expect(effectRuns).toBe(1);
      expect(name.value).toBe('John');

      // Change count - should trigger effect and batch the name update
      count.value = 1;

      // Should only run once more, and name should be updated
      expect(effectRuns).toBe(2);
      expect(name.value).toBe('Jane');

      dispose();
    });
  });
});
