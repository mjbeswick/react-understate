type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
};

type ResourceConfig = {
  cacheDuration?: number; // milliseconds
  retryAttempts?: number;
  retryDelay?: number;
};

export function createResourceManager<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  config: ResourceConfig = {},
) {
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  // State
  const resourceState = state<ResourceState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  let currentController: AbortController | null = null;
  let retryCount = 0;

  // Derived values
  const data = derived(() => resourceState().data);
  const loading = derived(() => resourceState().loading);
  const error = derived(() => resourceState().error);

  const isStale = derived(() => {
    const state = resourceState();
    if (!state.lastFetch) return true;

    const now = Date.now();
    const fetchTime = state.lastFetch.getTime();
    return now - fetchTime > cacheDuration;
  });

  // Actions
  const fetch = action(async (force = false) => {
    const state = resourceState();

    // Skip if already loading or data is fresh
    if (state.loading || (!force && !isStale() && state.data)) {
      return state.data;
    }

    // Cancel previous request
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    // Update loading state
    resourceState({
      ...state,
      loading: true,
      error: null,
    });

    try {
      const result = await fetcher(signal);

      if (!signal.aborted) {
        retryCount = 0; // Reset retry count on success
        resourceState({
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date(),
        });
        return result;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Don't handle aborted requests
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Retry logic
      if (retryCount < retryAttempts) {
        retryCount++;
        console.log(
          `Retrying request (attempt ${retryCount}/${retryAttempts})`,
        );

        setTimeout(() => {
          if (!signal.aborted) {
            fetch(force);
          }
        }, retryDelay * retryCount); // Exponential backoff

        return;
      }

      // Max retries reached
      resourceState({
        ...resourceState(),
        loading: false,
        error: errorMessage,
      });
    } finally {
      if (currentController?.signal === signal) {
        currentController = null;
      }
    }
  });

  const refresh = action(() => fetch(true));

  const cancel = action(() => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }

    resourceState({
      ...resourceState(),
      loading: false,
    });
  });

  const clearError = action(() => {
    resourceState({
      ...resourceState(),
      error: null,
    });
  });

  return {
    // State
    data,
    loading,
    error,
    isStale,

    // Actions
    fetch,
    refresh,
    cancel,
    clearError,
  };
}

// Usage example
export const userResource = createResourceManager<User[]>(
  async signal => {
    const response = await fetch('/api/users', { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
  {
    cacheDuration: 10 * 60 * 1000, // 10 minutes
    retryAttempts: 3,
    retryDelay: 1000,
  },
);
