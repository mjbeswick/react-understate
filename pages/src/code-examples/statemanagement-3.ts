// Direct updates
count(42);
message('New message');
isVisible(false);

// Functional updates
count(prev => prev + 1);
items(prev => [...prev, 'new item']);

// Object updates (shallow merge)
user(prev => ({
  ...prev,
  name: 'John Doe',
  isLoggedIn: true,
}));

// Deep object updates
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

// Multiple updates (automatically batched)
function updateProfile(name: string, email: string) {
  user(prev => ({ ...prev, name }));
  user(prev => ({ ...prev, email }));
  // Both updates are batched into a single re-render
}

// Async updates
async function loadUser(id: number) {
  user(prev => ({ ...prev, loading: true }));
  
  try {
    const userData = await fetchUser(id);
    user(prev => ({
      ...prev,
      ...userData,
      loading: false,
      isLoggedIn: true,
    }));
  } catch (error) {
    user(prev => ({
      ...prev,
      loading: false,
      error: error.message,
    }));
  }
}