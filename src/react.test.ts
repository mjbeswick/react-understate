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
    setReact(null as any);
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
        testState.subscribe,
        expect.any(Function),
        expect.any(Function)
      );

      // Verify the getter functions work correctly
      const [, getSnapshot, getServerSnapshot] =
        mockReact.useSyncExternalStore.mock.calls[0];
      expect(getSnapshot()).toBe(42);
      expect(getServerSnapshot()).toBe(42);
    });
  });
});
