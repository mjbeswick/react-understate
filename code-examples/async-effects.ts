import { effect } from 'react-understate';
import { shouldRefresh, isLoading } from './async-basic-store';
import { fetchUsersWithCancellation } from './async-cancellation';

export const autoFetchEffect = effect(
  () => {
    console.log('effect: checking if auto-fetch needed');
    const needsRefresh = shouldRefresh();
    const loading = isLoading();
    if (needsRefresh && !loading) {
      console.log('effect: triggering auto-fetch');
      fetchUsersWithCancellation();
    }
  },
  { name: 'autoFetchEffect' },
);

let retryTimeoutId: number | null = null;
export const autoRetryEffect = effect(
  () => {
    const hasErr = false; // replace with derived if needed
    const loading = isLoading();
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId);
      retryTimeoutId = null;
    }
    if (hasErr && !loading) {
      console.log('effect: scheduling retry in 5 seconds');
      retryTimeoutId = window.setTimeout(() => {
        console.log('effect: retrying failed request');
        fetchUsersWithCancellation();
      }, 5000);
    }
    return () => {
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
    };
  },
  { name: 'autoRetryEffect' },
);
