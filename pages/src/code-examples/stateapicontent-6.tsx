import { state, useUnderstate } from 'react-understate';

// Create a store with state and actions
const userStore = {
  // State
  profile: state({
    name: '',
    email: '',
    avatar: null as string | null
  }),
  isLoading: state(false),
  errors: state([] as string[]),
  
  // Actions
  updateProfile: (updates: Partial<typeof userStore.profile.value>) => {
    userStore.profile.value = { ...userStore.profile.value, ...updates };
  },
  
  setLoading: (loading: boolean) => {
    userStore.isLoading.value = loading;
  },
  
  addError: (error: string) => {
    userStore.errors.value = [...userStore.errors.value, error];
  },
  
  clearErrors: () => {
    userStore.errors.value = [];
  },
  
  // Async action
  saveProfile: async () => {
    userStore.setLoading(true);
    userStore.clearErrors();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userStore.profile.value)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const updatedProfile = await response.json();
      userStore.profile.value = updatedProfile;
    } catch (error) {
      userStore.addError(error.message);
    } finally {
      userStore.setLoading(false);
    }
  }
};

// Use the store in components
function UserProfileEditor() {
  const { profile, isLoading, errors, updateProfile, saveProfile } = 
    useUnderstate(userStore);
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
      <input
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
        placeholder="Name"
        disabled={isLoading}
      />
      <input
        value={profile.email}
        onChange={(e) => updateProfile({ email: e.target.value })}
        placeholder="Email"
        disabled={isLoading}
      />
      
      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => <div key={i}>{error}</div>)}
        </div>
      )}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}