import { state, action } from 'react-understate';

// Multiple state atoms
const count = state(0, { name: 'count' });
const name = state('', { name: 'name' });
const isVisible = state(false, { name: 'isVisible' });

// Automatic batching in event handlers
function handleButtonClick() {
  // These three updates are automatically batched
  count(prev => prev + 1);
  name('Button clicked');
  isVisible(true);
  // Only one re-render will occur
}

// Automatic batching in actions
export const updateUserProfile = action((userData: UserData) => {
  console.log('action: updating user profile');
  
  // All these updates are batched together
  name(userData.name);
  email(userData.email);
  avatar(userData.avatar);
  preferences(userData.preferences);
  
  // Only one re-render for all updates
}, { name: 'updateUserProfile' });

// Automatic batching in effects
export const syncEffect = effect(() => {
  const data = externalData();
  
  if (data) {
    // These updates are batched
    processData(data);
    updateCache(data);
    notifySubscribers(data);
  }
}, { name: 'syncEffect' });