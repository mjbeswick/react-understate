import { state, derived, action } from 'react-understate';

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
    cacheDuration = 5 * 60 * 1000,
    retryAttempts = 3,
    retryDelay = 1000,
  } = config;

  const resourceState = state<ResourceState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  let currentController: AbortController | null = null;
  let retryCount = 0;

  const data = derived(() => resourceState().data);
  const loading = derived(() => resourceState().loading);
  const error = derived(() => resourceState().error);

  const isStale = derived(() => {
    const stateVal = resourceState();
    if (!stateVal.lastFetch) return true;
    const now = Date.now();
    const fetchTime = stateVal.lastFetch.getTime();
    return now - fetchTime > cacheDuration;
  });

  const fetch = action(async (force = false) => {
    const stateVal = resourceState();
    if (stateVal.loading || (!force && !isStale() && stateVal.data)) {
      return stateVal.data;
    }
    if (currentController) currentController.abort();
    currentController = new AbortController();
    const signal = currentController.signal;
    resourceState({ ...stateVal, loading: true, error: null });
    try {
      const result = await fetcher(signal);
      if (!signal.aborted) {
        retryCount = 0;
        resourceState({
          data: result,
          loading: false,
          error: null,
          lastFetch: new Date(),
        });
        return result;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (retryCount < retryAttempts) {
        retryCount++;
        console.log(
          `Retrying request (attempt ${retryCount}/${retryAttempts})`,
        );
        setTimeout(() => {
          if (!signal.aborted) fetch(force);
        }, retryDelay * retryCount);
        return;
      }
      resourceState({
        ...resourceState(),
        loading: false,
        error: errorMessage,
      });
    } finally {
      if (currentController?.signal === signal) currentController = null;
    }
  });

  const refresh = action(() => fetch(true));
  const cancel = action(() => {
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
    resourceState({ ...resourceState(), loading: false });
  });
  const clearError = action(() => {
    resourceState({ ...resourceState(), error: null });
  });

  return { data, loading, error, isStale, fetch, refresh, cancel, clearError };
}
