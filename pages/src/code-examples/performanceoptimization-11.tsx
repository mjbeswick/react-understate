const expensiveOperation = action(async data => {
  const startTime = performance.now();

  try {
    // Your expensive operation
    const result = await processLargeDataset(data);

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 100) {
      // Log operations over 100ms
      console.warn(`Slow operation: ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}, 'expensiveOperation');
