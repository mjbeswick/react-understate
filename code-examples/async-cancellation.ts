import { action } from 'react-understate';
import { fetchUsers } from './async-basic-store';

let currentController: AbortController | null = null;

export const fetchUsersWithCancellation = action(
  async () => {
    console.log('action: fetching users with cancellation');

    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    try {
      await fetchUsers(undefined as unknown as void, { signal } as any);
    } finally {
      if (currentController?.signal === signal) {
        currentController = null;
      }
    }
  },
  { name: 'fetchUsersWithCancellation' },
);

export const cancelCurrentRequest = action(
  () => {
    console.log('action: cancelling current request');
    if (currentController) {
      currentController.abort();
      currentController = null;
    }
  },
  { name: 'cancelCurrentRequest' },
);
