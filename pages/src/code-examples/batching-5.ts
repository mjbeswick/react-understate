// Derived values and batching
const items = state<Item[]>([], { name: 'items' });
const filter = state('', { name: 'filter' });
const sortBy = state('name', { name: 'sortBy' });

// Derived value that depends on multiple state atoms
const filteredAndSortedItems = derived(() => {
  console.log('derived: recalculating filtered and sorted items');
  
  const allItems = items();
  const filterValue = filter();
  const sortField = sortBy();
  
  let filtered = allItems;
  if (filterValue) {
    filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  return filtered.sort((a, b) => 
    a[sortField].localeCompare(b[sortField])
  );
}, { name: 'filteredAndSortedItems' });

// Batching updates to multiple dependencies
export const updateFilterAndSort = action((newFilter: string, newSortBy: string) => {
  console.log('action: updating filter and sort');
  
  batch(() => {
    filter(newFilter);
    sortBy(newSortBy);
    // filteredAndSortedItems only recalculates once after both updates
  });
}, { name: 'updateFilterAndSort' });

// Batching with derived value dependencies
export const addItemAndUpdateStats = action((item: Item) => {
  console.log('action: adding item and updating stats');
  
  batch(() => {
    items(prev => [...prev, item]);
    // These derived values will recalculate after the batch
    totalCount(items().length);
    lastAddedItem(item);
    updateTimestamp(new Date());
  });
}, { name: 'addItemAndUpdateStats' });

// Performance monitoring for derived values
const createMonitoredDerived = <T>(
  computation: () => T,
  name: string
) => {
  let calculationCount = 0;
  
  return derived(() => {
    calculationCount++;
    const start = performance.now();
    
    const result = computation();
    
    const duration = performance.now() - start;
    if (duration > 5) { // Log slow calculations
      console.warn(\`Derived "\${name}" calculation #\${calculationCount} took \${duration.toFixed(2)}ms\`);
    }
    
    return result;
  }, { name });
};

// Usage
const expensiveDerived = createMonitoredDerived(
  () => performExpensiveCalculation(),
  'expensiveDerived'
);