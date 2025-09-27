import { state, action, ConcurrentActionError } from './core';
import { effect } from './effects';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Abort Signals', () => {
  beforeEach(() => {
    // Clear any existing state
    if (typeof window !== 'undefined' && (window as any).reactUnderstate) {
      (window as any).reactUnderstate.states = {};
      (window as any).reactUnderstate.actions = {};
    }
    mockFetch.mockClear();
  });

  describe('Action Abort Signals', () => {
    it('should pass abort signal to async actions', async () => {
      const data = state(null, 'data');
      let receivedSignal: AbortSignal | null = null;

      const fetchData = action(
        async (id: number, { signal }: { signal: AbortSignal }) => {
          receivedSignal = signal;
          mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ id, data: 'test' }),
          });
          const response = await fetch(`https://api.example.com/data/${id}`, {
            signal,
          });
          data.value = await response.json();
        },
        'fetchData',
      );

      await fetchData(1);

      expect(receivedSignal).toBeInstanceOf(AbortSignal);
      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/data/1', {
        signal: receivedSignal,
      });
    });

    it('should abort previous request when action is called again', async () => {
      const data = state(null, 'data');
      let abortCount = 0;

      const fetchData = action(
        async (id: number, { signal }: { signal: AbortSignal }) => {
          signal.addEventListener('abort', () => {
            abortCount++;
          });

          // Simulate slow request
          await new Promise(resolve => setTimeout(resolve, 100));

          mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ id, data: 'test' }),
          });
          const response = await fetch(`https://api.example.com/data/${id}`, {
            signal,
          });
          data.value = await response.json();
        },
        {
          name: 'fetchDataDropAbortTwice',
          concurrency: 'drop',
        },
      );

      // Start first request (will be dropped by the next call). Attach catch
      // immediately to avoid unhandled rejection before assertions.
      const promise1 = fetchData(1).catch(e => e);

      // Start second request immediately (drops/aborts first)
      const promise2 = fetchData(2);

      // First should resolve with the expected error instance due to the catch above
      await expect(promise1).resolves.toBeInstanceOf(ConcurrentActionError);
      await expect(promise2).resolves.toBeUndefined();

      // First request should have been aborted once
      expect(abortCount).toBe(1);
    });

    it('should handle fetch with abort signal', async () => {
      const data = state(null, 'data');
      let fetchCalls = 0;

      // Mock fetch to support abort behavior and simulate an abort
      // via the signal without needing a second concurrent call.
      mockFetch.mockImplementation((url: string, options: any) => {
        fetchCalls++;
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve({
              json: () => Promise.resolve({ url, data: 'test' }),
            });
          }, 50);

          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(
                new DOMException('The operation was aborted.', 'AbortError'),
              );
            });
            // Simulate an abort shortly after starting
            setTimeout(() => {
              try {
                // Dispatch an abort event on the signal to simulate cancellation
                options.signal.dispatchEvent(new Event('abort'));
              } catch {
                // If dispatchEvent isn't supported on the signal in this env, ignore
              }
            }, 10);
          }
        });
      });

      // Use a unique action name to avoid cross-test interference.
      const fetchData = action(
        async (id: number, { signal }: { signal: AbortSignal }) => {
          try {
            const response = await fetch(`https://api.example.com/data/${id}`, {
              signal,
            });
            data.value = await response.json();
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              // Request was aborted, this is expected and should be handled
              return;
            }
            throw error;
          }
        },
        { name: 'fetchDataAbortSingle' },
      );

      // Single call that will be aborted by the simulated signal
      await expect(fetchData(1)).resolves.toBeUndefined();

      // Should have made 1 fetch call that was aborted and handled
      expect(fetchCalls).toBe(1);
    });
  });

  describe('Effect Abort Signals', () => {
    it('should pass abort signal to async effects', async () => {
      const data = state(null, 'data');
      let receivedSignal: AbortSignal | null = null;

      const processData = effect(
        async ({ signal }: { signal: AbortSignal }) => {
          receivedSignal = signal;
          try {
            mockFetch.mockResolvedValueOnce({
              json: () => Promise.resolve({ processed: true }),
            });
            const response = await fetch('https://api.example.com/process', {
              signal,
            });
            data.value = await response.json();
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              // Request was aborted, this is expected
              return;
            }
            throw error;
          }
        },
        'processData',
      );

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedSignal).toBeInstanceOf(AbortSignal);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/process',
        { signal: receivedSignal },
      );

      processData();
    });

    it('should pass abort signal to async effects', async () => {
      const data = state(null, 'data');
      let receivedSignal: AbortSignal | null = null;

      const processData = effect(
        async ({ signal }: { signal: AbortSignal }) => {
          receivedSignal = signal;
          try {
            mockFetch.mockResolvedValueOnce({
              json: () => Promise.resolve({ processed: true }),
            });
            const response = await fetch('https://api.example.com/process', {
              signal,
            });
            data.value = await response.json();
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              // Request was aborted, this is expected
              return;
            }
            throw error;
          }
        },
        'processData',
      );

      // Wait for effect to run
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(receivedSignal).toBeInstanceOf(AbortSignal);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/process',
        { signal: receivedSignal },
      );

      processData();
    });
  });

  describe('Action with Fetch API Unit Tests', () => {
    it('should work with fetch API abort signals', async () => {
      const data = state(null, 'data');
      let requestCount = 0;

      mockFetch.mockImplementation((url: string, options: any) => {
        requestCount++;
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve({
              json: () => Promise.resolve({ url, requestCount }),
            });
          }, 100);

          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(
                new DOMException('The operation was aborted.', 'AbortError'),
              );
            });
          }
        });
      });

      const fetchData = action(
        async (id: number, { signal }: { signal: AbortSignal }) => {
          try {
            const response = await fetch(`https://api.example.com/data/${id}`, {
              signal,
            });
            data.value = await response.json();
          } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
              // Request was aborted, this is expected
              return;
            }
            throw error;
          }
        },
        'fetchData',
      );

      // Start multiple rapid requests
      const promises = [fetchData(1), fetchData(2), fetchData(3)];

      await Promise.allSettled(promises);

      // Should have made 3 requests, but only the last one should complete
      expect(requestCount).toBe(3);
    });
  });
});
