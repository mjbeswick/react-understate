import { state, effect } from 'react-understate';

// Basic state
const count = state(0, { name: 'count' });
const isVisible = state(true, { name: 'isVisible' });

// Simple effect
export const logCountEffect = effect(() => {
  console.log('effect: count changed to', count());
}, { name: 'logCountEffect' });

// Effect with conditional logic
export const visibilityEffect = effect(() => {
  const visible = isVisible();
  
  if (visible) {
    console.log('effect: element is now visible');
    document.title = `Count: ${count()}`;
  } else {
    console.log('effect: element is now hidden');
    document.title = 'Hidden';
  }
}, { name: 'visibilityEffect' });

// Effect with cleanup
export const intervalEffect = effect(() => {
  const interval = setInterval(() => {
    console.log('effect: interval tick, count is', count());
  }, 1000);
  
  // Cleanup function
  return () => {
    console.log('effect: cleaning up interval');
    clearInterval(interval);
  };
}, { name: 'intervalEffect' });