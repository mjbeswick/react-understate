import { state, derived, action, effect } from 'react-understate';

// Data types
type User = {
  id: number;
  name: string;
  email: string;
};

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// State
export const users = state<User[]>([], { name: 'users' });
export const loadingState = state<LoadingState>('idle', { name: 'loadingState' });
export const error = state<string | null>(null, { name: 'error' });
export const lastFetch = state<Date | null>(null, { name: 'lastFetch' });

// Derived values
export const isLoading = derived(() => loadingState() === 'loading', {
  name: 'isLoading',
});

export const hasError = derived(() => error() !== null, {
  name: 'hasError',
});

export const isEmpty = derived(() => users().length === 0, {
  name: 'isEmpty',
});

export const shouldRefresh = derived(() => {
  const last = lastFetch();
  if (!last) return true;
  
  // Refresh if data is older than 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return last < fiveMinutesAgo;
}, { name: 'shouldRefresh' });

// Actions
export const fetchUsers = action(async (signal?: AbortSignal) => {
  console.log('action: fetching users');
  
  loadingState('loading');
  error(null);
  
  try {
    const response = await fetch('/api/users', { signal });
    
    if (!response.ok) {
      throw new Error(\`Failed to fetch users: \${response.statusText}\`);
    }
    
    const userData: User[] = await response.json();
    
    // Only update if not aborted
    if (!signal?.aborted) {
      users(userData);
      loadingState('success');
      lastFetch(new Date());
    }
  } catch (err) {
    // Don't treat aborted requests as errors
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('action: fetch cancelled');
      return;
    }
    
    console.error('action: fetch error', err);
    error(err instanceof Error ? err.message : 'Unknown error');
    loadingState('error');
  }
}, { name: 'fetchUsers' });

export const refreshUsers = action(async () => {
  console.log('action: refreshing users');
  await fetchUsers();
}, { name: 'refreshUsers' });

export const clearError = action(() => {
  console.log('action: clearing error');
  error(null);
  if (loadingState() === 'error') {
    loadingState('idle');
  }
}, { name: 'clearError' });