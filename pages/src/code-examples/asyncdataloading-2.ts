// Enhanced store with cancellation support
let currentController: AbortController | null = null;

export const fetchUsersWithCancellation = action(async () => {
  console.log('action: fetching users with cancellation');
  
  // Cancel previous request if still pending
  if (currentController) {
    currentController.abort();
  }
  
  // Create new controller for this request
  currentController = new AbortController();
  const signal = currentController.signal;
  
  try {
    await fetchUsers(signal);
  } finally {
    // Clear controller when done
    if (currentController?.signal === signal) {
      currentController = null;
    }
  }
}, { name: 'fetchUsersWithCancellation' });

export const cancelCurrentRequest = action(() => {
  console.log('action: cancelling current request');
  
  if (currentController) {
    currentController.abort();
    currentController = null;
  }
}, { name: 'cancelCurrentRequest' });