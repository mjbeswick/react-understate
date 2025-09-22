import { state, action, configureDebug } from 'react-understate';

// Enable debugging globally
configureDebug({ 
  enabled: true, 
  showFile: true,
  showTimestamp: true
});

const count = state(0, 'counter');

// Actions will be automatically logged with timing
const increment = action(() => {
  console.log('Before increment:', count.value);
  count.value++;
  console.log('After increment:', count.value);
}, 'increment');

const expensiveOperation = action(async (n: number) => {
  // Simulate expensive work
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  for (let i = 0; i < n; i++) {
    count.value = i;
  }
}, 'expensiveOperation');

// Manual timing for complex operations
const complexAction = action(async () => {
  const startTime = performance.now();
  
  try {
    await expensiveOperation(100);
    
    const endTime = performance.now();
    console.log(`Complex action completed in ${endTime - startTime}ms`);
    
  } catch (error) {
    console.error('Complex action failed:', error);
  }
}, 'complexAction');

// Debug output will show:
// [increment] Action called
// [increment] Completed in 0.1ms
// [expensiveOperation] Action called with args: [100]
// [expensiveOperation] Completed in 1002.3ms
