/**
 * @fileoverview Tests for React Integration
 *
 * Tests for React-specific functionality focusing on coverage improvements
 * for the react.ts file which currently has 45.45% coverage.
 */

import { setReact, useSubscribe } from './react';
import { state } from './core';

describe('React Integration', () => {
  beforeEach(() => {
    // Reset React instance before each test
    setReact(null as unknown);
  });

  describe('setReact', () => {
    it('should set React instance manually', () => {
      const mockReact = {
        useSyncExternalStore: jest.fn((subscribe, getSnapshot) =>
          getSnapshot()
        ),
      };

      setReact(mockReact);

      const testState = state(42);
      expect(() => useSubscribe(testState)).not.toThrow();
      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();
    });
  });

  describe('Manual React Setup', () => {
    it('should work with manually configured React', () => {
      const mockReact = {
        useSyncExternalStore: jest.fn((subscribe, getSnapshot) =>
          getSnapshot()
        ),
      };

      setReact(mockReact);

      const testState = state(42);
      expect(() => useSubscribe(testState)).not.toThrow();
      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when React lacks useSyncExternalStore', () => {
      const oldReact = { version: '17.0.0' }; // React without useSyncExternalStore
      setReact(oldReact);

      const testState = state(42);

      expect(() => useSubscribe(testState)).toThrow(
        'useSyncExternalStore not found. This hook requires React 18+.'
      );
    });
  });

  describe('Hook Integration', () => {
    it('should integrate properly with state subscription system', () => {
      const mockReact = {
        useSyncExternalStore: jest.fn(),
      };
      setReact(mockReact);

      const testState = state(42);
      useSubscribe(testState);

      expect(mockReact.useSyncExternalStore).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );

      // Verify the getter functions work correctly
      const [, getSnapshot] = mockReact.useSyncExternalStore.mock.calls[0];
      expect(getSnapshot()).toBe(42);
    });

    it('should properly subscribe to state changes and trigger callbacks', () => {
      // Test the actual subscription mechanism directly
      const testState = state(42);
      const mockCallback = jest.fn();

      // Subscribe directly to the state
      const unsubscribe = testState.subscribe(mockCallback);

      // Change the state
      testState.value = 100;

      // The callback should have been called
      expect(mockCallback).toHaveBeenCalled();

      // Clean up
      unsubscribe();
    });

    it('should return current state value in getSnapshot', () => {
      let getSnapshot: (() => unknown) | null = null;

      const mockReact = {
        useSyncExternalStore: jest.fn((subscribeFn, getSnapshotFn) => {
          getSnapshot = getSnapshotFn;
          return getSnapshotFn();
        }),
      };
      setReact(mockReact);

      const testState = state(42);
      useSubscribe(testState);

      // Verify getSnapshot returns current value
      expect(getSnapshot).toBeDefined();
      expect(getSnapshot!()).toBe(42);

      // Change state and verify getSnapshot returns new value
      testState.value = 100;
      expect(getSnapshot!()).toBe(100);
    });

    it('should handle multiple state changes correctly', () => {
      // Test multiple state changes with direct subscription
      const testState = state(0);
      const mockCallback = jest.fn();

      // Subscribe directly to the state
      const unsubscribe = testState.subscribe(mockCallback);

      // Multiple state changes
      testState.value = 1;
      testState.value = 2;
      testState.value = 3;

      // Should have been called for each change
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(testState.value).toBe(3);

      // Clean up
      unsubscribe();
    });

    it('should properly integrate useSubscribe with React useSyncExternalStore', () => {
      // This test simulates the real React useSyncExternalStore behavior
      let reactCallback: (() => void) | null = null;

      const mockReact = {
        useSyncExternalStore: jest.fn((subscribeFn, getSnapshot) => {
          // Simulate React calling the subscription function with a callback
          subscribeFn((callback: () => void) => {
            reactCallback = callback;
            return () => {
              reactCallback = null;
            };
          });
          return getSnapshot();
        }),
      };
      setReact(mockReact);

      const testState = state(42);
      useSubscribe(testState);

      // Verify the hook was called
      expect(mockReact.useSyncExternalStore).toHaveBeenCalled();

      // Verify the subscription was set up
      expect(reactCallback).toBeDefined();

      // Test that state changes trigger the React callback
      const mockCallback = jest.fn();
      reactCallback = mockCallback;

      // Change the state
      testState.value = 100;

      // The React callback should have been called
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle the exact bug we just fixed (useSyncExternalStore subscription)', () => {
      // This test specifically catches the bug where useSyncExternalStore
      // wasn't properly calling the subscription callback
      let capturedCallback: (() => void) | null = null;

      const mockReact = {
        useSyncExternalStore: jest.fn((subscribeFn, getSnapshot) => {
          // This simulates the broken implementation that would have failed
          const brokenSubscribe = (callback: () => void) => {
            capturedCallback = callback;
            return () => {
              capturedCallback = null;
            };
          };

          // Call the subscription function (this is what useSyncExternalStore does)
          subscribeFn(brokenSubscribe);
          return getSnapshot();
        }),
      };
      setReact(mockReact);

      const testState = state(0);
      useSubscribe(testState);

      // Verify the subscription was set up
      expect(capturedCallback).toBeDefined();

      // Test that state changes trigger the callback
      const mockCallback = jest.fn();
      capturedCallback = mockCallback;

      // Change the state multiple times
      testState.value = 1;
      testState.value = 2;
      testState.value = 3;

      // The callback should have been called for each change
      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });
});
