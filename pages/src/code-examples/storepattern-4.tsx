// Compose multiple stores
import { todoStore } from './todoStore';
import { userStore } from './userStore';
import { settingsStore } from './settingsStore';

// Create a root store that combines all features
export const appStore = {
  ...todoStore,
  ...userStore,
  ...settingsStore,
};

// Or organize by namespaces
export const appStore = {
  todos: todoStore,
  user: userStore,
  settings: settingsStore,
};

// Usage in component
function App() {
  const { todos, user, settings } = useUnderstate(appStore);
  // ... component logic
}
