import { state, derived } from 'react-understate';

const largeDataset = state([
  /* thousands of items */
]);
const searchTerm = state('');
const sortOrder = state('asc');

// ❌ Inefficient - processes everything on every change
const processedData = derived(() => {
  const filtered = largeDataset.value.filter(item =>
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );

  return filtered.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
});

// ✅ More efficient - split into steps
const filteredData = derived(() =>
  largeDataset.value.filter(item =>
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  ),
);

const sortedData = derived(() => {
  const filtered = filteredData.value;
  return [...filtered].sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
});

// Now sorting only happens when sort order changes,
// and filtering only happens when search term or data changes
