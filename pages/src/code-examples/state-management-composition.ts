import { state, derived } from 'react-understate';

// ❌ Avoid: Monolithic state
export const badAppState = state({
  user: { id: 1, name: 'John' },
  todos: [{ id: 1, text: 'Learn React' }],
  ui: { theme: 'dark', sidebar: true },
  settings: { notifications: true },
  // ... everything in one giant object
});

// ✅ Good: Atomic state composition
export const user = state(
  {
    id: null as number | null,
    name: '',
    email: '',
  },
  { name: 'user' },
);

type Todo = { id: number; text: string };
export const todos = state<Todo[]>([], { name: 'todos' });

export const uiSettings = state(
  {
    theme: 'light' as 'light' | 'dark',
    sidebarOpen: false,
  },
  { name: 'uiSettings' },
);

export const userSettings = state(
  {
    notifications: true,
    autoSave: false,
    language: 'en',
  },
  { name: 'userSettings' },
);

// Compose when needed
export const appData = derived(
  () => ({
    user: user(),
    todos: todos(),
    ui: uiSettings(),
    settings: userSettings(),
  }),
  { name: 'appData' },
);
