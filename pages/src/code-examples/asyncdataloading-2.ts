// Auto-cancellation is handled by Understate via AbortSignals.
// Multiple calls to the same async action will abort previous requests.

export const fetchUsersWithCancellation = action(
  async () => {
    console.log('action: fetching users with cancellation');
    await fetchUsers();
  },
  { name: 'fetchUsersWithCancellation' },
);

// Kept for API parity with examples; note that explicit cancel isn't necessary
// because unmounts and subsequent calls auto-abort in-progress requests.
export const cancelCurrentRequest = action(
  () => {
    console.log('action: cancel not required; previous requests auto-abort');
  },
  { name: 'cancelCurrentRequest' },
);
