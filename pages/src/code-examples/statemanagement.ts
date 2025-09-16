import { state } from 'react-understate';

// Simple primitive state
export const count = state(0, { name: 'count' });
export const message = state('Hello World', { name: 'message' });
export const isVisible = state(true, { name: 'isVisible' });

// Object state
export const user = state({
  id: null as number | null,
  name: '',
  email: '',
  isLoggedIn: false,
}, { name: 'user' });

// Array state
export const items = state<string[]>([], { name: 'items' });

// Complex nested state
export const appState = state({
  ui: {
    theme: 'light' as 'light' | 'dark',
    sidebar: {
      open: false,
      width: 250,
    },
  },
  data: {
    users: [] as User[],
    loading: false,
    error: null as string | null,
  },
}, { name: 'appState' });