/**
 * @fileoverview Tests for React Integration
 *
 * Tests for React-specific functionality focusing on coverage improvements
 * for the react.ts file which currently has 45.45% coverage.
 */

import { useUnderstate } from './react';
import { state } from './core';

// Mock use-sync-external-store/shim
jest.mock('use-sync-external-store/shim', () => ({
  useSyncExternalStore: jest.fn(),
}));

describe('React Hook Unit Tests', () => {
  let mockUseSyncExternalStore: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Get the mocked function
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mockUseSyncExternalStore = require('use-sync-external-store/shim')
      .useSyncExternalStore as jest.Mock;

    mockUseSyncExternalStore.mockImplementation((subscribe, getSnapshot) => {
      // Return the current snapshot value
      return getSnapshot();
    });
  });

  // setReact removed; React is auto-detected

  describe('useUnderstate', () => {
    it('should call useSyncExternalStore with correct parameters for single state', () => {
      const testState = state(42);

      const result = useUnderstate(testState);

      expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
      );
      expect(result).toEqual([42]);
    });

    it('should return current state value in getSnapshot for single state', () => {
      const testState = state(42);

      const result = useUnderstate(testState);

      const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
      const snapshot = getSnapshot();
      expect(snapshot).toEqual('[42]');
      expect(result).toEqual([42]);
    });

    it('should work with basic states and return array of values', () => {
      const testState = state(42);

      const result = useUnderstate(testState);

      const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
      expect(typeof getSnapshot).toBe('function');
      // Call getSnapshot to get the actual value
      const snapshotValue = getSnapshot();
      expect(snapshotValue).toEqual('[42]');
      expect(result).toEqual([42]);
    });

    it('should call useSyncExternalStore with proper subscription function', () => {
      const testState = state(0);

      useUnderstate(testState);

      const [subscribe] = mockUseSyncExternalStore.mock.calls[0];

      // Verify that subscribe is a function that returns an unsubscribe function
      expect(typeof subscribe).toBe('function');
      const unsubscribe = subscribe(() => {});
      expect(typeof unsubscribe).toBe('function');
    });

    it('should work with multiple states and return array of values', () => {
      const state1 = state(42);
      const state2 = state('hello');

      const result = useUnderstate(state1, state2);

      const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
      const snapshot = getSnapshot();
      expect(snapshot).toEqual('[42,"hello"]');
      expect(result).toEqual([42, 'hello']);
    });

    it('should subscribe to all provided states', () => {
      const state1 = state(0);
      const state2 = state('test');

      const result = useUnderstate(state1, state2);

      const [subscribe] = mockUseSyncExternalStore.mock.calls[0];
      const unsubscribe = subscribe(() => {});

      // Verify unsubscribe is a function
      expect(typeof unsubscribe).toBe('function');

      // Verify we can call unsubscribe without errors
      expect(() => unsubscribe()).not.toThrow();

      // Verify result is array of values
      expect(result).toEqual([0, 'test']);
    });

    describe('store object pattern', () => {
      it('should handle store objects with state properties', () => {
        const count = state(42);
        const name = state('John');
        const store = {
          count,
          name,
          increment: () => count.value++,
        };

        const result = useUnderstate(store);

        expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
        );
        expect(result).toEqual({
          count: 42,
          name: 'John',
          increment: store.increment,
        });
      });

      it('should return current values from store object', () => {
        const count = state(10);
        const name = state('Alice');
        const store = {
          count,
          name,
          greet: () => `Hello ${name.value}`,
        };

        const result = useUnderstate(store);

        const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
        const snapshot = getSnapshot();
        expect(snapshot).toEqual('[10,"Alice"]');
        expect(result).toEqual({
          count: 10,
          name: 'Alice',
          greet: store.greet,
        });
      });

      it('should subscribe to all states in store object', () => {
        const count = state(0);
        const name = state('test');
        const store = { count, name };

        useUnderstate(store);

        const [subscribe] = mockUseSyncExternalStore.mock.calls[0];
        const unsubscribe = subscribe(() => {});

        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should handle store objects with mixed properties', () => {
        const count = state(5);
        const store = {
          count,
          multiplier: 2,
          calculate: () => count.value * 2,
        };

        const result = useUnderstate(store);

        expect(result).toEqual({
          count: 5,
          multiplier: 2,
          calculate: store.calculate,
        });
      });

      it('should handle empty store objects', () => {
        const store = {};

        const result = useUnderstate(store);

        expect(result).toEqual({});
        expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
        );
      });
    });
  });
});
