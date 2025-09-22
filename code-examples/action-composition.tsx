import { state, action, batch } from 'react-understate';

const user = state({ name: '', email: '', preferences: { theme: 'light' } });
const isLoading = state(false);
const notification = state<string | null>(null);

// Basic actions
const setLoading = action((loading: boolean) => {
  isLoading.value = loading;
}, 'setLoading');

const showNotification = action((message: string) => {
  notification.value = message;
  setTimeout(() => {
    notification.value = null;
  }, 3000);
}, 'showNotification');

const updateUserField = action((field: string, value: any) => {
  user.value = { ...user.value, [field]: value };
}, 'updateUserField');

// Composed actions
const updateProfile = action(async (name: string, email: string) => {
  setLoading(true);

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update multiple fields atomically
    batch(() => {
      updateUserField('name', name);
      updateUserField('email', email);
    });

    showNotification('Profile updated successfully!');
  } catch (error) {
    showNotification('Failed to update profile');
  } finally {
    setLoading(false);
  }
}, 'updateProfile');

const resetToDefaults = action(() => {
  batch(() => {
    user.value = {
      name: '',
      email: '',
      preferences: { theme: 'light' },
    };
    notification.value = null;
  });
  showNotification('Reset to defaults');
}, 'resetToDefaults');

// Complex workflow action
const onboardNewUser = action(
  async (userData: { name: string; email: string }) => {
    setLoading(true);

    try {
      // Step 1: Validate data
      if (!userData.email.includes('@')) {
        throw new Error('Invalid email address');
      }

      // Step 2: Update profile
      await updateProfile(userData.name, userData.email);

      // Step 3: Set default preferences
      updateUserField('preferences', {
        theme: 'light',
        notifications: true,
        language: 'en',
      });

      // Step 4: Show welcome message
      showNotification(`Welcome, ${userData.name}!`);

      // Step 5: Additional setup...
      console.log('User onboarding completed');
    } catch (error) {
      showNotification(error.message);
      resetToDefaults();
    } finally {
      setLoading(false);
    }
  },
  'onboardNewUser',
);
