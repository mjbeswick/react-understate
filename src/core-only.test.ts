/**
 * @fileoverview Tests for Core-Only Module
 *
 * Tests for the core-only module that provides state functionality
 * without React integration for bundle size optimization.
 */

import * as CoreOnly from './core-only';

describe('Core-Only Module', () => {
  describe('Exports', () => {
    it('should export state function', () => {
      expect(typeof CoreOnly.state).toBe('function');
    });

    it('should export derived function', () => {
      expect(typeof CoreOnly.derived).toBe('function');
    });

    it('should export effect function', () => {
      expect(typeof CoreOnly.effect).toBe('function');
    });

    it('should export batch function', () => {
      expect(typeof CoreOnly.batch).toBe('function');
    });

    it('should not export React-specific functions', () => {
      expect((CoreOnly as any).useUnderstate).toBeUndefined();
      expect((CoreOnly as any).setReact).toBeUndefined();
    });
  });

  describe('Functionality', () => {
    it('should provide working state functionality', () => {
      const count = CoreOnly.state(0);

      expect(count.value).toBe(0);

      count.value = 42;
      expect(count.value).toBe(42);
    });

    it('should provide working derived functionality', () => {
      const base = CoreOnly.state(10);
      const doubled = CoreOnly.derived(() => base.value * 2);

      expect(doubled.value).toBe(20);

      base.value = 15;
      expect(doubled.value).toBe(30);
    });

    it('should provide working effect functionality', () => {
      const count = CoreOnly.state(0);

      const effectFn = jest.fn();
      CoreOnly.effect(() => {
        effectFn(count.value);
      });

      expect(effectFn).toHaveBeenCalledWith(0);

      count.value = 1;
      expect(effectFn).toHaveBeenCalledWith(1);
    });

    it('should provide working batch functionality', () => {
      const count = CoreOnly.state(0);

      let notifications = 0;
      const unsubscribe = count.subscribe(() => notifications++);

      CoreOnly.batch(() => {
        count.value = 1;
        count.value = 2;
        count.value = 3;
      });

      expect(count.value).toBe(3);
      expect(notifications).toBe(1); // Only one notification despite multiple updates

      unsubscribe();
    });
  });

  describe('TypeScript Types', () => {
    it('should provide State type', () => {
      const count: CoreOnly.State<number> = CoreOnly.state(0);
      expect(count.value).toBe(0);
    });

    it('should provide derived state type', () => {
      const base = CoreOnly.state(10);
      const doubled: CoreOnly.State<number> = CoreOnly.derived(
        () => base.value * 2,
      );
      expect(doubled.value).toBe(20);
    });
  });

  describe('Derived Value Unit Tests', () => {
    it('should compute derived value from state', () => {
      const base = CoreOnly.state(10);
      const doubled = CoreOnly.derived(() => base.value * 2);

      expect(doubled.value).toBe(20);
    });

    it('should update derived value when state changes', () => {
      const base = CoreOnly.state(10);
      const doubled = CoreOnly.derived(() => base.value * 2);

      base.value = 15;
      expect(doubled.value).toBe(30);
    });
  });

  describe('Effect Unit Tests', () => {
    it('should execute effect function on creation', () => {
      const source = CoreOnly.state(1);
      const effectFn = jest.fn();

      CoreOnly.effect(() => {
        effectFn(source.value * 2);
      });

      expect(effectFn).toHaveBeenCalledWith(2);
    });

    it('should re-execute effect when dependency changes', () => {
      const source = CoreOnly.state(1);
      const effectFn = jest.fn();

      CoreOnly.effect(() => {
        effectFn(source.value * 2);
      });

      source.value = 5;

      expect(effectFn).toHaveBeenCalledWith(10);
    });
  });

  describe('State Unit Tests', () => {
    it('should create state with initial value', () => {
      const state = CoreOnly.state(1);
      expect(state.value).toBe(1);
    });

    it('should update state value', () => {
      const state = CoreOnly.state(1);
      state.value = 10;
      expect(state.value).toBe(10);
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should provide minimal API surface', () => {
      const expectedExports = ['state', 'derived', 'effect', 'batch'];
      const actualExports = Object.keys(CoreOnly);

      // Should only export the core functionality
      expectedExports.forEach(exportName => {
        expect(actualExports).toContain(exportName);
      });

      // Should not have any React-specific exports
      expect(actualExports).not.toContain('useUnderstate');
      expect(actualExports).not.toContain('setReact');
    });

    it('should work without any React dependencies', () => {
      // This test verifies that core-only module doesn't depend on React
      // by ensuring basic functionality works without any React setup

      const state1 = CoreOnly.state('hello');
      const state2 = CoreOnly.state('world');

      expect(state1.value).toBe('hello');
      expect(state2.value).toBe('world');

      state1.value = 'goodbye';
      state2.value = 'universe';

      expect(state1.value).toBe('goodbye');
      expect(state2.value).toBe('universe');
    });
  });

  describe('State Properties', () => {
    it('should handle toString method', () => {
      const testState = CoreOnly.state(42);
      expect(testState.toString()).toBe('42');

      const stringState = CoreOnly.state('hello');
      expect(stringState.toString()).toBe('hello');

      const objectState = CoreOnly.state({ name: 'test' });
      expect(objectState.toString()).toBe('[object Object]');
    });
  });

  describe('Internal Functions', () => {
    it('should export internal functions', () => {
      const {
        activeEffect,
        isBatching,
        pendingUpdates,
        setActiveEffect,
        setIsBatching,
        flushUpdates,
        // eslint-disable-next-line @typescript-eslint/no-var-requires
      } = require('./core');

      expect(typeof activeEffect).toBe('object');
      expect(typeof isBatching).toBe('boolean');
      expect(typeof pendingUpdates).toBe('object');
      expect(typeof setActiveEffect).toBe('function');
      expect(typeof setIsBatching).toBe('function');
      expect(typeof flushUpdates).toBe('function');
    });

    it('should handle setActiveEffect', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { setActiveEffect } = require('./core');

      const testEffect = () => {};
      const prev = setActiveEffect(testEffect);
      expect(prev).toBe(null);

      const newEffect = () => {};
      const prev2 = setActiveEffect(newEffect);
      expect(prev2).toBe(testEffect);
    });

    it('should handle setIsBatching', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { setIsBatching } = require('./core');

      const prev = setIsBatching(true);
      expect(prev).toBe(false);

      const prev2 = setIsBatching(false);
      expect(prev2).toBe(true);
    });

    it('should handle flushUpdates', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { flushUpdates } = require('./core');

      // Should not throw when no updates are pending
      expect(() => flushUpdates()).not.toThrow();
    });
  });
});
