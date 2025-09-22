import { effect } from 'react-understate';

// Auto-fetch when component mounts or when refresh is needed
export const autoFetchEffect = effect(() => {
  console.log('effect: checking if auto-fetch needed');
  
  const needsRefresh = shouldRefresh();
  const currentlyLoading = isLoading();
  
  if (needsRefresh && !currentlyLoading) {
    console.log('effect: triggering auto-fetch');
    fetchUsersWithCancellation();
  }
}, { name: 'autoFetchEffect' });

// Auto-retry failed requests after a delay
let retryTimeoutId: number | null = null;

export const autoRetryEffect = effect(() => {
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
      fetchUsersWithCancellation();
    }, 5000);
  }
  
  // Cleanup function
  return () => {
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }
  };
}, { name: 'autoRetryEffect' });