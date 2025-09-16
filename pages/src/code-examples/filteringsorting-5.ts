// Memoized filtering for expensive operations
const createMemoizedFilter = <T>(
  items: () => T[],
  filterFn: (item: T) => boolean,
  name: string
) => {
  let lastItems: T[] = [];
  let lastFiltered: T[] = [];
  let lastFilterHash = '';
  
  return derived(() => {
    const currentItems = items();
    const currentFilterHash = JSON.stringify(filterFn);
    
    // Check if we can use cached result
    if (currentItems === lastItems && currentFilterHash === lastFilterHash) {
      return lastFiltered;
    }
    
    // Recalculate
    const filtered = currentItems.filter(filterFn);
    
    // Update cache
    lastItems = currentItems;
    lastFiltered = filtered;
    lastFilterHash = currentFilterHash;
    
    return filtered;
  }, { name });
};

// Usage
export const memoizedFilteredTodos = createMemoizedFilter(
  () => todos(),
  (todo) => {
    const text = filterText().toLowerCase();
    const completed = filterCompleted();
    
    if (text && !todo.text.toLowerCase().includes(text)) return false;
    if (completed === 'active' && todo.completed) return false;
    if (completed === 'completed' && !todo.completed) return false;
    
    return true;
  },
  'memoizedFilteredTodos'
);

// Virtual scrolling for large lists
export const createVirtualList = <T>(
  items: () => T[],
  itemHeight: number,
  containerHeight: number,
  name: string
) => {
  const scrollTop = state(0, { name: \`\${name}ScrollTop\` });
  
  const visibleItems = derived(() => {
    const allItems = items();
    const scroll = scrollTop();
    
    const startIndex = Math.floor(scroll / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      allItems.length
    );
    
    return allItems.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, { name: \`\${name}VisibleItems\` });
  
  const totalHeight = derived(() => items().length * itemHeight, {
    name: \`\${name}TotalHeight\`
  });
  
  return {
    scrollTop,
    visibleItems,
    totalHeight,
    setScrollTop: action((top: number) => {
      scrollTop(Math.max(0, top));
    }, { name: \`set\${name}ScrollTop\` }),
  };
};

// Usage
const virtualList = createVirtualList(
  () => sortedTodos(),
  50, // item height
  400, // container height
  'todos'
);

// Debounced filtering for search
export const createDebouncedFilter = <T>(
  items: () => T[],
  searchQuery: () => string,
  filterFn: (item: T, query: string) => boolean,
  delay: number,
  name: string
) => {
  const debouncedQuery = state('', { name: \`\${name}DebouncedQuery\` });
  let timeoutId: number | null = null;
  
  // Debounce search query
  const debounceSearch = action((query: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      debouncedQuery(query);
      timeoutId = null;
    }, delay);
  }, { name: \`debounce\${name}Search\` });
  
  // Filtered items
  const filteredItems = derived(() => {
    const allItems = items();
    const query = debouncedQuery();
    
    if (!query) return allItems;
    
    return allItems.filter(item => filterFn(item, query));
  }, { name: \`\${name}FilteredItems\` });
  
  return {
    debouncedQuery,
    filteredItems,
    debounceSearch,
  };
};

// Usage
const debouncedSearch = createDebouncedFilter(
  () => todos(),
  () => searchQuery(),
  (todo, query) => todo.text.toLowerCase().includes(query.toLowerCase()),
  300,
  'todos'
);