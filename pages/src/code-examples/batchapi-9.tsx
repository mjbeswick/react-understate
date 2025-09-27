// ❌ Overly broad batching
function processLargeDataset(data: any[]) {
  batch(() => {
    // Long running operation inside batch
    const processed = data.map(item => expensiveProcessing(item));

    results.value = processed;
    isLoading.value = false;
  });
}

// ✅ Batch only the state updates
function processLargeDataset(data: any[]) {
  // Do expensive work outside batch
  const processed = data.map(item => expensiveProcessing(item));

  // Batch only the state updates
  batch(() => {
    results.value = processed;
    isLoading.value = false;
  });
}
