// ❌ One large state - changing name updates everything
const user = state({
  profile: { name: '', email: '', bio: '' },
  preferences: { theme: 'light', notifications: true },
  activities: [...] // Large array
});

// ✅ Split into focused states
const userProfile = state({ name: '', email: '', bio: '' });
const userPreferences = state({ theme: 'light', notifications: true });
const userActivities = state([...]);

// Components only re-render when their specific state changes