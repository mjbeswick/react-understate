// 1. Debounced effects
const createDebouncedEffect = <T>(
  computation: () => T,
  delay: number,
  name: string
) => {
  let timeoutId: number | null = null;
  
  return effect(() => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = window.setTimeout(() => {
      computation();
      timeoutId = null;
    }, delay);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, { name });
};

// Usage: Debounced search
const searchQuery = state('', { name: 'searchQuery' });
const searchResults = state<any[]>([], { name: 'searchResults' });

export const debouncedSearchEffect = createDebouncedEffect(
  () => {
    const query = searchQuery();
    if (!query.trim()) {
      searchResults([]);
      return;
    }
    
    performSearch(query).then(results => {
      searchResults(results);
    });
  },
  300,
  'debouncedSearchEffect'
);

// 2. Effect chains
const data = state<any[]>([], { name: 'data' });
const filtered = state<any[]>([], { name: 'filtered' });
const sorted = state<any[]>([], { name: 'sorted' });

// First effect: filter data
export const filterEffect = effect(() => {
  const items = data();
  const filteredItems = items.filter(item => item.active);
  filtered(filteredItems);
}, { name: 'filterEffect' });

// Second effect: sort filtered data
export const sortEffect = effect(() => {
  const items = filtered();
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  sorted(sortedItems);
}, { name: 'sortEffect' });