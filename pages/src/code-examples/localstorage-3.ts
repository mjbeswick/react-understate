import { effect } from 'react-understate';

// Effect to sync changes across tabs
export const crossTabSyncEffect = effect(() => {
  console.log('effect: setting up cross-tab sync');
  
  const handleStorageChange = (event: StorageEvent) => {
    if (!event.key || !event.newValue) return;
    
    try {
      // Handle user settings sync
      if (event.key === 'user-settings-v2') {
        const newSettings = JSON.parse(event.newValue);
        console.log('effect: syncing user settings from other tab');
        userSettings(newSettings);
      }
      
      // Handle app data sync
      if (event.key === 'app-data-v1') {
        const newAppData = JSON.parse(event.newValue);
        console.log('effect: syncing app data from other tab');
        appData(newAppData);
      }
    } catch (error) {
      console.error('effect: failed to sync from other tab', error);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, { name: 'crossTabSyncEffect' });

// Manual sync trigger (useful for testing or forced sync)
export const syncFromStorage = action(() => {
  console.log('action: manually syncing from storage');
  
  try {
    const settingsData = localStorage.getItem('user-settings-v2');
    if (settingsData) {
      userSettings(JSON.parse(settingsData));
    }
    
    const appDataStr = localStorage.getItem('app-data-v1');
    if (appDataStr) {
      appData(JSON.parse(appDataStr));
    }
  } catch (error) {
    console.error('action: failed to sync from storage', error);
  }
}, { name: 'syncFromStorage' });