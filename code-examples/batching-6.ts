// 1. Batching debug utility
export const createBatchingDebugger = () => {
  let batchCount = 0;
  let updateCount = 0;
  let isInBatch = false;
  
  const originalBatch = batch;
  
  // Override batch function for debugging
  const debugBatch = (fn: () => void) => {
    batchCount++;
    isInBatch = true;
    updateCount = 0;
    
    console.group(`Batch #${batchCount}`);
    console.log('Starting batch');
    
    const startTime = performance.now();
    
    originalBatch(() => {
      fn();
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Batch completed: ${updateCount} updates in ${duration.toFixed(2)}ms`);
    console.groupEnd();
    
    isInBatch = false;
  };
  
  // Override state functions to count updates
  const createDebugState = <T>(initialValue: T, name: string) => {
    const stateInstance = state(initialValue, { name });
    const originalSet = stateInstance;
    
    return (value: T | ((prev: T) => T)) => {
      updateCount++;
      console.log(`Update #${updateCount} in ${isInBatch ? 'batch' : 'individual'}: ${name}`);
      return originalSet(value);
    };
  };
  
  return { debugBatch, createDebugState, getStats: () => ({ batchCount, updateCount }) };
};

// 2. Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {
    batchCount: 0,
    individualUpdateCount: 0,
    totalBatchTime: 0,
    maxBatchTime: 0,
  };
  
  const monitorBatch = (fn: () => void) => {
    const start = performance.now();
    batch(fn);
    const duration = performance.now() - start;
    
    metrics.batchCount++;
    metrics.totalBatchTime += duration;
    metrics.maxBatchTime = Math.max(metrics.maxBatchTime, duration);
  };
  
  const logMetrics = () => {
    const avgBatchTime = metrics.totalBatchTime / metrics.batchCount;
    console.table({
      'Total Batches': metrics.batchCount,
      'Individual Updates': metrics.individualUpdateCount,
      'Average Batch Time (ms)': avgBatchTime.toFixed(2),
      'Max Batch Time (ms)': metrics.maxBatchTime.toFixed(2),
    });
  };
  
  return { monitorBatch, logMetrics, metrics };
};

// 3. Batching analyzer
export const analyzeBatching = () => {
  const analysis = {
    recommendedBatches: [] as string[],
    performanceIssues: [] as string[],
    suggestions: [] as string[],
  };
  
  // Analyze state update patterns
  const stateUpdatePatterns = analyzeStateUpdates();
  
  stateUpdatePatterns.forEach(pattern => {
    if (pattern.frequency > 10 && pattern.updatesPerSecond > 5) {
      analysis.recommendedBatches.push(
        `Consider batching updates to ${pattern.stateName} (updated ${pattern.frequency} times)`
      );
    }
    
    if (pattern.averageUpdateTime > 5) {
      analysis.performanceIssues.push(
        `Slow updates detected for ${pattern.stateName} (${pattern.averageUpdateTime}ms average)`
      );
    }
  });
  
  return analysis;
};

// 4. Real-time batching monitor
export const createRealtimeMonitor = () => {
  const monitor = {
    isMonitoring: false,
    startTime: 0,
    updates: [] as Array<{ state: string; time: number; batched: boolean }>,
  };
  
  const startMonitoring = () => {
    monitor.isMonitoring = true;
    monitor.startTime = performance.now();
    monitor.updates = [];
    
    console.log('🔍 Starting batching monitor');
  };
  
  const stopMonitoring = () => {
    monitor.isMonitoring = false;
    
    const duration = performance.now() - monitor.startTime;
    const batchedUpdates = monitor.updates.filter(u => u.batched).length;
    const individualUpdates = monitor.updates.length - batchedUpdates;
    
    console.log('📊 Batching Monitor Results:');
    console.log(`Duration: ${duration.toFixed(2)}ms`);
    console.log(`Total Updates: ${monitor.updates.length}`);
    console.log(`Batched Updates: ${batchedUpdates}`);
    console.log(`Individual Updates: ${individualUpdates}`);
    console.log(`Batching Efficiency: ${((batchedUpdates / monitor.updates.length) * 100).toFixed(1)}%`);
  };
  
  return { startMonitoring, stopMonitoring, monitor };
};