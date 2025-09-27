import { state, effect } from 'react-understate';

const searchTerm = state('', 'searchTerm');
const searchResults = state([], 'searchResults');

let searchTimeout: NodeJS.Timeout;

effect(() => {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const term = searchTerm.value;

  if (!term.trim()) {
    searchResults.value = [];
    return;
  }

  // Debounce the search by 300ms
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      const results = await response.json();
      searchResults.value = results;
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, 300);

  // Cleanup timeout on effect disposal
  return () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };
}, 'debouncedSearch');
