/**
 * @fileoverview Tests for flexible parameter API
 *
 * Tests that state, action, and effect functions support both:
 * - String name as second parameter
 * - Options object as second parameter (with optional name property)
 */

// Jest globals are available without import
import { state, action } from './core';
import { effect } from './effects';

describe('Flexible Parameter API', () => {
  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Clean up any global state if needed
  });

  describe('state function', () => {
    it('should work with no parameters (just initial value)', () => {
      const count = state(0);
      expect(count.value).toBe(0);

      count.value = 5;
      expect(count.value).toBe(5);
    });

    it('should work with string name as second parameter', () => {
      const count = state(0, 'counter');
      expect(count.value).toBe(0);

      count.value = 10;
      expect(count.value).toBe(10);
    });

    it('should work with options object as second parameter', () => {
      const count = state(0, { name: 'counter' });
      expect(count.value).toBe(0);

      count.value = 15;
      expect(count.value).toBe(15);
    });

    it('should work with options object including observeMutations', () => {
      const user = state(
        { name: 'John', age: 30 },
        { name: 'user', observeMutations: true },
      );
      expect(user.value.name).toBe('John');
      expect(user.value.age).toBe(30);

      // Test that we can update the object
      user.value = { name: 'Jane', age: 25 };
      expect(user.value.name).toBe('Jane');
      expect(user.value.age).toBe(25);
    });

    it('should work with options object without name', () => {
      const data = state([], { observeMutations: true });
      expect(Array.isArray(data.value)).toBe(true);
      expect(data.value.length).toBe(0);
    });
  });

  describe('action function', () => {
    it('should work with no name parameter', () => {
      let called = false;
      const testAction = action(() => {
        called = true;
      });

      testAction();
      expect(called).toBe(true);
    });

    it('should work with string name as second parameter', () => {
      let called = false;
      const testAction = action(() => {
        called = true;
      }, 'testAction');

      testAction();
      expect(called).toBe(true);
    });

    it('should work with options object as second parameter', () => {
      let called = false;
      const testAction = action(
        () => {
          called = true;
        },
        { name: 'testAction' },
      );

      testAction();
      expect(called).toBe(true);
    });

    it('should work with options object including concurrency', () => {
      let callCount = 0;
      const testAction = action(
        async () => {
          callCount++;
          await new Promise(resolve => setTimeout(resolve, 10));
        },
        { name: 'testAction', concurrency: 'drop' },
      );

      // First call should execute
      testAction();
      expect(callCount).toBe(1);
    });

    it('should work with options object without name', () => {
      let called = false;
      const testAction = action(
        () => {
          called = true;
        },
        { concurrency: 'queue' },
      );

      testAction();
      expect(called).toBe(true);
    });
  });

  describe('effect function', () => {
    it('should work with no name parameter', () => {
      const count = state(0);
      let effectRan = false;

      const dispose = effect(() => {
        count.value; // Read to establish dependency
        effectRan = true;
      });

      expect(effectRan).toBe(true);
      dispose();
    });

    it('should work with string name as second parameter', () => {
      const count = state(0);
      let effectRan = false;

      const dispose = effect(() => {
        count.value; // Read to establish dependency
        effectRan = true;
      }, 'testEffect');

      expect(effectRan).toBe(true);
      dispose();
    });

    it('should work with options object as second parameter', () => {
      const count = state(0);
      let effectRan = false;

      const dispose = effect(
        () => {
          count.value; // Read to establish dependency
          effectRan = true;
        },
        { name: 'testEffect' },
      );

      expect(effectRan).toBe(true);
      dispose();
    });

    it('should work with options object including once option', () => {
      const count = state(0);
      let runCount = 0;

      const dispose = effect(
        () => {
          count.value; // Read to establish dependency
          runCount++;
        },
        { name: 'onceEffect', once: true },
      );

      expect(runCount).toBe(1);

      // Change the state - effect should not run again due to once: true
      count.value = 1;
      expect(runCount).toBe(1);

      dispose();
    });

    it('should work with options object including preventOverlap option', () => {
      const count = state(0);
      let runCount = 0;

      const dispose = effect(
        () => {
          count.value; // Read to establish dependency
          runCount++;
        },
        { name: 'noOverlapEffect', preventOverlap: true },
      );

      expect(runCount).toBe(1);
      dispose();
    });

    it('should work with options object including preventLoops option', () => {
      const count = state(0);
      let runCount = 0;

      const dispose = effect(
        () => {
          count.value; // Read to establish dependency
          runCount++;
        },
        { name: 'noLoopsEffect', preventLoops: false },
      );

      expect(runCount).toBe(1);
      dispose();
    });

    it('should work with options object without name', () => {
      const count = state(0);
      let effectRan = false;

      const dispose = effect(
        () => {
          count.value; // Read to establish dependency
          effectRan = true;
        },
        { once: true },
      );

      expect(effectRan).toBe(true);
      dispose();
    });
  });

  describe('Parameter validation', () => {
    it('should validate state names when provided as string', () => {
      expect(() => state(0, 'valid_name5')).not.toThrow();
      expect(() => state(0, { name: 'valid_name6' })).not.toThrow();

      // Invalid names should throw
      expect(() => state(0, 'invalid.name')).toThrow();
      expect(() => state(0, { name: 'invalid.name2' })).toThrow();
    });

    it('should validate action names when provided', () => {
      const fn = () => {};
      expect(() => action(fn, 'valid_name1')).not.toThrow();
      expect(() => action(fn, { name: 'valid_name2' })).not.toThrow();

      // Invalid names should throw
      expect(() => action(fn, 'invalid.name')).toThrow();
      expect(() => action(fn, { name: 'invalid.name2' })).toThrow();
    });

    it('should validate effect names when provided', () => {
      const fn = () => {};
      const dispose1 = effect(fn, 'valid_name3');
      const dispose2 = effect(fn, { name: 'valid_name4' });

      // Clean up
      dispose1();
      dispose2();

      // Invalid names should throw
      expect(() => effect(fn, 'invalid.name')).toThrow();
      expect(() => effect(fn, { name: 'invalid.name2' })).toThrow();
    });
  });

  describe('Type safety', () => {
    it('should maintain proper TypeScript types for state', () => {
      const stringState = state('hello', 'stringState');
      const numberState = state(42, { name: 'numberState' });
      const objectState = state({ x: 1, y: 2 }, { name: 'objectState' });

      // These should compile without errors
      const str: string = stringState.value;
      const num: number = numberState.value;
      const obj: { x: number; y: number } = objectState.value;

      expect(str).toBe('hello');
      expect(num).toBe(42);
      expect(obj.x).toBe(1);
      expect(obj.y).toBe(2);
    });

    it('should maintain proper TypeScript types for action', () => {
      const stringAction = action(
        (s: string) => s.toUpperCase(),
        'stringAction',
      );
      const numberAction = action((n: number) => n * 2, {
        name: 'numberAction',
      });

      // These should compile and work correctly
      const result1 = stringAction('hello');
      const result2 = numberAction(21);

      expect(result1).toBe('HELLO');
      expect(result2).toBe(42);
    });
  });
});
