import { state, effect } from 'react-understate';

const searchQuery = state('', 'searchQuery');
const searchResults = state([], 'searchResults');
const isLoading = state(false, 'isLoading');

// Search effect that prevents overlapping API calls
effect(async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.value)}`);
    const results = await response.json();
    
    searchResults.value = results;
    console.log(`Found ${results.length} results for "${searchQuery.value}"`);
  } catch (error) {
    console.error('Search failed:', error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
}, 'searchEffect', { preventOverlap: true });

// Multiple rapid changes won't cause overlapping API calls
searchQuery.value = 'react';
searchQuery.value = 'vue';      // Previous search is cancelled
searchQuery.value = 'angular';  // Previous search is cancelled
// Only the last search ('angular') will complete