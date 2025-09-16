// ❌ One large state - changing name updates everything
const user = state({
  profile: { name: '', email: '', bio: '' },
  preferences: { theme: 'light', notifications: true },
  activities: [...], // Large array
  settings: { privacy: 'public', language: 'en' },
});

// ✅ Split into focused states
const userProfile = state({ name: '', email: '', bio: '' });
const userPreferences = state({ theme: 'light', notifications: true });
const userActivities = state([...]);
const userSettings = state({ privacy: 'public', language: 'en' });

// Components only re-render when their specific state changes
function ProfileComponent() {
  const [profile] = useUnderstate(userProfile);
  // Only re-renders when profile changes, not when preferences change
}

function PreferencesComponent() {
  const [preferences] = useUnderstate(userPreferences);
  // Only re-renders when preferences change, not when profile changes
}