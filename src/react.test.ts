/**
 * @fileoverview Tests for React Integration
 *
 * Tests for React-specific functionality focusing on coverage improvements
 * for the react.ts file which currently has 45.45% coverage.
 */

import { setReact, useSubscribe } from './react';
import { state } from './core';

// Mock use-sync-external-store/shim
jest.mock('use-sync-external-store/shim', () => ({
  useSyncExternalStore: jest.fn(),
}));

describe('React Integration', () => {
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

  describe('setReact', () => {
    it('should show deprecation warning when called', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      setReact({} as unknown);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('setReact() is deprecated')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('useSubscribe', () => {
    it('should call useSyncExternalStore with correct parameters', () => {
      const testState = state(42);

      useSubscribe(testState);

      expect(mockUseSyncExternalStore).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should return current state value in getSnapshot', () => {
      const testState = state(42);

      useSubscribe(testState);

      const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
      expect(getSnapshot()).toBe(42);
    });

    it('should work with basic states', () => {
      const testState = state(42);

      useSubscribe(testState);

      const [, getSnapshot] = mockUseSyncExternalStore.mock.calls[0];
      expect(typeof getSnapshot).toBe('function');
      // Call getSnapshot to get the actual value
      const snapshotValue = getSnapshot();
      expect(snapshotValue).toBe(42);
    });

    it('should call useSyncExternalStore with proper subscription function', () => {
      const testState = state(0);

      useSubscribe(testState);

      const [subscribe] = mockUseSyncExternalStore.mock.calls[0];

      // Verify that subscribe is a function that returns an unsubscribe function
      expect(typeof subscribe).toBe('function');
      const unsubscribe = subscribe(() => {});
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
