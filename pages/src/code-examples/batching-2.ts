import { state, batch, action } from 'react-understate';

// Manual batching for complex operations
export const complexUpdate = action(() => {
  console.log('action: performing complex update');
  
  batch(() => {
    // All updates inside batch() are grouped together
    user(prev => ({ ...prev, name: 'John' }));
    settings(prev => ({ ...prev, theme: 'dark' }));
    notifications(prev => ({ ...prev, enabled: true }));
    
    // Derived values won't recalculate until batch completes
    const userDisplay = `${user().name} - ${settings().theme}`;
    console.log('User display:', userDisplay);
  });
  
  // Re-renders happen after batch completes
}, { name: 'complexUpdate' });

// Nested batching
export const nestedBatching = action(() => {
  console.log('action: nested batching example');
  
  batch(() => {
    // First batch
    count(1);
    name('First');
    
    batch(() => {
      // Nested batch - still part of the outer batch
      count(2);
      name('Second');
      
      batch(() => {
        // Deeply nested - still batched
        count(3);
        name('Third');
      });
    });
    
    // This is also part of the outer batch
    isVisible(true);
  });
  
  // All updates are batched together, only one re-render
}, { name: 'nestedBatching' });

// Conditional batching
export const conditionalBatching = action((shouldBatch: boolean) => {
  console.log('action: conditional batching', shouldBatch);
  
  if (shouldBatch) {
    batch(() => {
      updateMultipleStates();
    });
  } else {
    // Updates happen individually
    updateMultipleStates();
  }
}, { name: 'conditionalBatching' });

function updateMultipleStates() {
  state1('value1');
  state2('value2');
  state3('value3');
}