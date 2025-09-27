import { state, effect } from 'react-understate';

const user = state(null, 'user');
const userSettings = state(null, 'userSettings');
const isOnline = state(true, 'isOnline');

effect(async () => {
  // Early return if conditions not met
  if (!user.value || !isOnline.value) {
    userSettings.value = null;
    return;
  }

  // Only fetch when user is logged in and online
  try {
    const response = await fetch(`/api/users/${user.value.id}/settings`);
    userSettings.value = await response.json();
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
}, 'loadUserSettings');
