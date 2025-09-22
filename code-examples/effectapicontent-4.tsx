import { state, effect } from 'react-understate';

const user = state(null, 'user');

// Initialize user session only once
effect(() => {
  console.log('Initializing user session...');
  // This will only run once, even if user changes
  initializeUserSession();
  loadUserPreferences();
}, 'initializeUser', { once: true });

// Setup global event listeners
effect(() => {
  const handleResize = () => {
    console.log('Window resized:', window.innerWidth, window.innerHeight);
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'k') {
      console.log('Search shortcut pressed');
    }
  };
  
  window.addEventListener('resize', handleResize);
  window.addEventListener('keydown', handleKeyPress);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyPress);
  };
}, 'setupGlobalListeners', { once: true });