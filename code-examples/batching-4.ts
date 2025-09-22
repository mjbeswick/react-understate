// 1. Conditional batching based on state
export const smartBatching = action(() => {
  console.log('action: smart batching');
  
  const shouldBatch = items().length > 10; // Batch only for large lists
  
  if (shouldBatch) {
    batch(() => {
      performBulkUpdates();
    });
  } else {
    performBulkUpdates(); // Individual updates for small lists
  }
}, { name: 'smartBatching' });

// 2. Batching with cleanup
export const batchedEffect = effect(() => {
  const data = externalData();
  
  if (data) {
    // Batch updates in effects
    batch(() => {
      processData(data);
      updateCache(data);
      notifySubscribers(data);
    });
  }
  
  return () => {
    // Cleanup can also be batched
    batch(() => {
      clearCache();
      removeSubscribers();
      resetState();
    });
  };
}, { name: 'batchedEffect' });

// 3. Batching with error handling
export const safeBatching = action(async () => {
  console.log('action: safe batching');
  
  try {
    const data = await fetchData();
    
    batch(() => {
      // All updates happen together or not at all
      processData(data);
      updateUI(data);
      clearErrors();
    });
  } catch (error) {
    batch(() => {
      // Batch error state updates
      setError(error.message);
      setLoading(false);
      resetData();
    });
  }
}, { name: 'safeBatching' });

// 4. Batching with performance monitoring
export const monitoredBatching = action(() => {
  console.log('action: monitored batching');
  
  const startTime = performance.now();
  
  batch(() => {
    performComplexUpdates();
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // Longer than one frame
    console.warn(`Batched update took ${duration.toFixed(2)}ms`);
  }
}, { name: 'monitoredBatching' });

// 5. Custom batching utility
export const createBatchingUtility = () => {
  let pendingUpdates: (() => void)[] = [];
  let isBatching = false;
  
  const batchedUpdate = (update: () => void) => {
    if (isBatching) {
      pendingUpdates.push(update);
    } else {
      update();
    }
  };
  
  const startBatch = () => {
    isBatching = true;
    pendingUpdates = [];
  };
  
  const endBatch = () => {
    if (pendingUpdates.length > 0) {
      batch(() => {
        pendingUpdates.forEach(update => update());
      });
    }
    isBatching = false;
    pendingUpdates = [];
  };
  
  return { batchedUpdate, startBatch, endBatch };
};

// Usage
const { batchedUpdate, startBatch, endBatch } = createBatchingUtility();

export const customBatchingExample = action(() => {
  console.log('action: custom batching example');
  
  startBatch();
  
  batchedUpdate(() => state1('value1'));
  batchedUpdate(() => state2('value2'));
  batchedUpdate(() => state3('value3'));
  
  endBatch(); // All updates are batched together
}, { name: 'customBatchingExample' });