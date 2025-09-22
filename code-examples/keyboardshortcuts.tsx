import { state, action, effect } from 'react-understate';

// State
const count = state(0, 'count');

// Actions
const increment = action(() => {
  count.value++;
}, 'increment');

const decrement = action(() => {
  count.value--;
}, 'decrement');

const reset = action(() => {
  count.value = 0;
}, 'reset');

// Keyboard shortcuts effect
const setupKeyboardShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent default for handled keys
    const handled = true;
    
    switch (event.key) {
      case 'ArrowUp':
      case '+':
        increment();
        break;
      case 'ArrowDown':
      case '-':
        decrement();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          reset();
        } else {
          handled = false;
        }
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      event.preventDefault();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  // Cleanup
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, 'setupKeyboardShortcuts');