import { state, action } from 'react-understate';

// Basic states
export const count = state(0, { name: 'count' });
export const message = state('Hello World', { name: 'message' });
export const isVisible = state(true, { name: 'isVisible' });
export const items = state<string[]>([], { name: 'items' });

// Object states
export type User = {
  id: number | null;
  name: string;
  email: string;
  isLoggedIn: boolean;
  loading?: boolean;
  error?: string | null;
};

export const user = state<User>(
  {
    id: null,
    name: '',
    email: '',
    isLoggedIn: false,
    loading: false,
    error: null,
  },
  { name: 'user' },
);

export const appState = state(
  {
    ui: {
      theme: 'light' as 'light' | 'dark',
      sidebar: {
        open: false,
        width: 250,
      },
    },
  },
  { name: 'appState' },
);

// ✅ Recommended: Use actions for state updates
export const setCount = action((value: number) => {
  count(value);
}, 'setCount');

export const setMessage = action((msg: string) => {
  message(msg);
}, 'setMessage');

export const setVisibility = action((visible: boolean) => {
  isVisible(visible);
}, 'setVisibility');

export const incrementCount = action(() => {
  count(prev => prev + 1);
}, 'incrementCount');

export const addItem = action((item: string) => {
  items(prev => [...prev, item]);
}, 'addItem');

export const updateUser = action((updates: Partial<User>) => {
  user(prev => ({ ...prev, ...updates }));
}, 'updateUser');

export const toggleSidebar = action(() => {
  appState(prev => ({
    ...prev,
    ui: {
      ...prev.ui,
      sidebar: {
        ...prev.ui.sidebar,
        open: !prev.ui.sidebar.open,
      },
    },
  }));
}, 'toggleSidebar');

// Multiple updates (automatically batched by the library)
export const updateProfile = action((name: string, email: string) => {
  user(prev => ({ ...prev, name }));
  user(prev => ({ ...prev, email }));
}, 'updateProfile');

// Mock async function
async function fetchUser(
  id: number,
): Promise<Pick<User, 'id' | 'name' | 'email'>> {
  await new Promise(r => setTimeout(r, 10));
  return { id, name: 'Jane Doe', email: 'jane@example.com' };
}

// Async updates using actions
export const loadUser = action(async (id: number) => {
  user(prev => ({ ...prev, loading: true, error: null }));

  try {
    const userData = await fetchUser(id);
    user(prev => ({
      ...prev,
      ...userData,
      loading: false,
      isLoggedIn: true,
    }));
  } catch (e) {
    const err = e as Error;
    user(prev => ({
      ...prev,
      loading: false,
      error: err.message,
    }));
  }
}, 'loadUser');
