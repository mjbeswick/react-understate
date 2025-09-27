// Large store with many states
const appStore = {
  user: state(null, 'user'),
  theme: state('light', 'theme'),
  notifications: state([], 'notifications'),
  settings: state({}, 'settings'),

  // ... many more states and actions
  updateTheme: action((theme: string) => {
    appStore.theme.value = theme;
  }, 'updateTheme'),
};

// Component only subscribes to what it needs
function ThemeToggle() {
  // Only subscribes to theme and updateTheme - not other states
  const { theme, updateTheme } = useUnderstate({
    theme: appStore.theme,
    updateTheme: appStore.updateTheme,
  });

  return (
    <button onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}

// Another component subscribes to different parts
function UserProfile() {
  // Only subscribes to user state
  const { user } = useUnderstate({
    user: appStore.user,
  });

  if (!user) return <div>Please log in</div>;

  return <div>Welcome, {user.name}!</div>;
}
