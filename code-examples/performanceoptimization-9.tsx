// For large datasets that might be garbage collected
const largeDataSet = new WeakMap();
const processedItems = new WeakSet();

const processLargeItem = (item) => {
  if (processedItems.has(item)) {
    return largeDataSet.get(item);
  }
  
  // Expensive processing...
  const result = expensiveProcessing(item);
  
  largeDataSet.set(item, result);
  processedItems.add(item);
  
  return result;
};