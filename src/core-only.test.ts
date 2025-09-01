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
      expect((CoreOnly as any).useSubscribe).toBeUndefined();
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

    it('should provide ReadonlyState type', () => {
      const base = CoreOnly.state(10);
      const doubled: CoreOnly.ReadonlyState<number> = CoreOnly.derived(
        () => base.value * 2
      );
      expect(doubled.value).toBe(20);
    });
  });

  describe('Integration', () => {
    it('should work with simple derived interactions', () => {
      const base = CoreOnly.state(10);
      const doubled = CoreOnly.derived(() => base.value * 2);

      expect(doubled.value).toBe(20);

      base.value = 15;
      expect(doubled.value).toBe(30);
    });

    it('should handle multiple effects correctly', () => {
      const source = CoreOnly.state(1);

      const effect1Fn = jest.fn();
      const effect2Fn = jest.fn();

      CoreOnly.effect(() => {
        effect1Fn(source.value * 2);
      });

      CoreOnly.effect(() => {
        effect2Fn(source.value * 3);
      });

      expect(effect1Fn).toHaveBeenCalledWith(2);
      expect(effect2Fn).toHaveBeenCalledWith(3);

      source.value = 5;

      expect(effect1Fn).toHaveBeenCalledWith(10);
      expect(effect2Fn).toHaveBeenCalledWith(15);
    });

    it('should handle simple state changes', () => {
      const a = CoreOnly.state(1);
      const b = CoreOnly.state(2);

      expect(a.value).toBe(1);
      expect(b.value).toBe(2);

      a.value = 10;
      b.value = 20;

      expect(a.value).toBe(10);
      expect(b.value).toBe(20);
    });
  });

  describe('Bundle Size Optimization', () => {
    it('should provide minimal API surface', () => {
      const expectedExports = ['state', 'derived', 'effect', 'batch'];
      const actualExports = Object.keys(CoreOnly);

      // Should only export the core functionality
      expectedExports.forEach((exportName) => {
        expect(actualExports).toContain(exportName);
      });

      // Should not have any React-specific exports
      expect(actualExports).not.toContain('useSubscribe');
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
});
