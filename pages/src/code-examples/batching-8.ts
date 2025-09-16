// ❌ Anti-pattern: Batching everything
const overBatching = action(() => {
  batch(() => {
    // Batching simple, unrelated updates
    count(count() + 1);
    name('John');
    isVisible(true);
    theme('dark');
    language('en');
  });
}, { name: 'overBatching' });

// ✅ Solution: Only batch related updates
const properBatching = action(() => {
  // Simple updates don't need batching
  count(count() + 1);
  
  // Batch related updates
  batch(() => {
    name('John');
    email('john@example.com');
    avatar('avatar.jpg');
  });
}, { name: 'properBatching' });

// ❌ Anti-pattern: Batching in derived values
const badDerivedBatching = derived(() => {
  batch(() => {
    // Don't batch in derived values!
    state1('value1');
    state2('value2');
  });
  
  return computeValue();
}, { name: 'badDerivedBatching' });

// ✅ Solution: Use actions for state updates
const goodActionBatching = action(() => {
  batch(() => {
    state1('value1');
    state2('value2');
  });
}, { name: 'goodActionBatching' });

// ❌ Anti-pattern: Nested batching without purpose
const unnecessaryNestedBatching = action(() => {
  batch(() => {
    state1('value1');
    
    batch(() => {
      state2('value2');
      
      batch(() => {
        state3('value3');
      });
    });
  });
}, { name: 'unnecessaryNestedBatching' });

// ✅ Solution: Single batch for related updates
const simpleBatching = action(() => {
  batch(() => {
    state1('value1');
    state2('value2');
    state3('value3');
  });
}, { name: 'simpleBatching' });

// ❌ Anti-pattern: Batching async operations incorrectly
const badAsyncBatching = action(async () => {
  batch(() => {
    // Don't batch async operations like this
    const data = await fetchData();
    processData(data);
  });
}, { name: 'badAsyncBatching' });

// ✅ Solution: Batch after async operations
const goodAsyncBatching = action(async () => {
  const data = await fetchData();
  
  batch(() => {
    processData(data);
    updateUI(data);
    clearLoading();
  });
}, { name: 'goodAsyncBatching' });

// ❌ Anti-pattern: Forgetting to handle errors in batches
const badErrorHandling = action(() => {
  batch(() => {
    // If any update fails, the whole batch might fail
    riskyUpdate1();
    riskyUpdate2();
    riskyUpdate3();
  });
}, { name: 'badErrorHandling' });

// ✅ Solution: Handle errors properly
const goodErrorHandling = action(() => {
  try {
    batch(() => {
      safeUpdate1();
      safeUpdate2();
      safeUpdate3();
    });
  } catch (error) {
    // Handle batch errors
    console.error('Batch failed:', error);
    rollbackChanges();
  }
}, { name: 'goodErrorHandling' });