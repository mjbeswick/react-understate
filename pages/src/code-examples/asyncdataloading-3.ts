import { effect } from 'react-understate';

// Auto-fetch when component mounts or when refresh is needed
export const autoFetchEffect = effect(
  async ({ signal }: { signal: AbortSignal }) => {
    console.log('effect: checking if auto-fetch needed');

    const needsRefresh = shouldRefresh();
    const currentlyLoading = isLoading();

    if (needsRefresh && !currentlyLoading) {
      console.log('effect: triggering auto-fetch');
      await fetchUsers();
    }
  },
  { name: 'autoFetchEffect' },
);

// Auto-retry failed requests after a delay
let retryTimeoutId: number | null = null;

export const autoRetryEffect = effect(
  ({ signal }: { signal: AbortSignal }) => {
    const hasErr = hasError();
    const loading = isLoading();

    // Clear existing timeout
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }

    // Set up retry if there's an error and not currently loading
    if (hasErr && !loading) {
      console.log('effect: scheduling retry in 5 seconds');
      retryTimeoutId = window.setTimeout(() => {
        console.log('effect: retrying failed request');
        // Understate auto-aborts previous fetches; action receives its own signal
        fetchUsers();
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
    };
  },
  { name: 'autoRetryEffect' },
);
