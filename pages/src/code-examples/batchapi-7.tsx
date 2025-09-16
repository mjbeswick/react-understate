import { state, batch } from 'react-understate';

const a = state(0);
const b = state(0);
const c = state(0);

function updateAB() {
  batch(() => {
    a.value = 1;
    b.value = 2;
  });
}

function updateAll() {
  batch(() => {
    updateAB(); // This batch is merged into the outer batch
    c.value = 3;
  });
  // All three updates (a, b, c) happen in a single re-render
}

// More complex nesting
function complexUpdate() {
  batch(() => {
    a.value = 10;
    
    batch(() => {
      b.value = 20;
      
      batch(() => {
        c.value = 30;
      });
    });
    
    // More updates at outer level
    a.value = a.value + 1; // Now 11
  });
  // Components re-render once with a=11, b=20, c=30
}