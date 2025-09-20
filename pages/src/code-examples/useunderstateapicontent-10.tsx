import { state, derived, useUnderstate, action } from 'react-understate';

// Define your types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AppState {
  currentUser: User | null;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}

// Type-safe store
const appStore = {
  // Explicitly typed states
  user: state<User | null>(null, 'user'),
  theme: state<AppState['theme']>('light', 'theme'),
  language: state<AppState['language']>('en', 'language'),
  
  // Derived values with inferred types
  isAdmin: derived(() => {
    return appStore.user.value?.role === 'admin';
  }, 'isAdmin'),
  
  userDisplayName: derived(() => {
    const user = appStore.user.value;
    return user ? `${user.name} (${user.email})` : 'Guest';
  }, 'userDisplayName'),
  
  // Type-safe actions
  setUser: action((user: User) => {
    appStore.user.value = user;
  }, 'setUser'),
  
  logout: action(() => {
    appStore.user.value = null;
  }, 'logout'),
  
  updateTheme: action((theme: AppState['theme']) => {
    appStore.theme.value = theme;
  }, 'updateTheme')
} as const; // 'as const' for better type inference

// Type-safe component
function UserProfile() {
  // TypeScript infers all types automatically
  const { 
    user,           // User | null
    isAdmin,        // boolean
    userDisplayName, // string
    theme,          // 'light' | 'dark'
    setUser,        // (user: User) => void
    logout,         // () => void
    updateTheme     // (theme: 'light' | 'dark') => void
  } = useUnderstate(appStore);
  
  const handleLogin = () => {
    setUser({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    });
  };
  
  return (
    <div>
      <h1>{userDisplayName}</h1>
      {user ? (
        <div>
          <p>Role: {user.role}</p>
          {isAdmin && <p>Admin privileges enabled</p>}
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      
      <select 
        value={theme} 
        onChange={(e) => updateTheme(e.target.value as AppState['theme'])}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

// Generic store factory for reusable patterns
function createEntityStore<T extends { id: string | number }>() {
  return {
    entities: state<T[]>([], 'entities'),
    selectedId: state<T['id'] | null>(null, 'selectedId'),
    
    selectedEntity: derived(() => {
      const entities = createEntityStore<T>().entities.value;
      const id = createEntityStore<T>().selectedId.value;
      return entities.find(entity => entity.id === id) || null;
    }),
    
    addEntity: action((entity: T) => {
      const store = createEntityStore<T>();
      store.entities.value = [...store.entities.value, entity];
    }),
    
    selectEntity: action((id: T['id']) => {
      const store = createEntityStore<T>();
      store.selectedId.value = id;
    })
  };
}