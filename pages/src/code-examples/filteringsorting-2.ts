// Sorting state
const sortField = state<keyof Todo>('createdAt', { name: 'sortField' });
const sortDirection = state<'asc' | 'desc'>('desc', { name: 'sortDirection' });
const sortPriority = state<number>(0, { name: 'sortPriority' }); // For multi-column sorting

// Sort configuration
const sortConfig = {
  text: (a: Todo, b: Todo) => a.text.localeCompare(b.text),
  createdAt: (a: Todo, b: Todo) => a.createdAt.getTime() - b.createdAt.getTime(),
  priority: (a: Todo, b: Todo) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  },
  category: (a: Todo, b: Todo) => a.category.localeCompare(b.category),
};

// Derived sorted todos
export const sortedTodos = derived(() => {
  const filtered = filteredTodos();
  const field = sortField();
  const direction = sortDirection();
  
  const sorted = [...filtered].sort((a, b) => {
    const result = sortConfig[field](a, b);
    return direction === 'asc' ? result : -result;
  });
  
  return sorted;
}, { name: 'sortedTodos' });

// Multi-column sorting
export const multiColumnSortedTodos = derived(() => {
  const filtered = filteredTodos();
  const primaryField = sortField();
  const primaryDirection = sortDirection();
  const secondaryField = sortPriority() > 0 ? 'priority' : null;
  
  return [...filtered].sort((a, b) => {
    // Primary sort
    let result = sortConfig[primaryField](a, b);
    if (primaryDirection === 'desc') result = -result;
    
    // Secondary sort if primary values are equal
    if (result === 0 && secondaryField) {
      result = sortConfig[secondaryField](a, b);
    }
    
    return result;
  });
}, { name: 'multiColumnSortedTodos' });

// Sorting actions
export const setSortField = action((field: keyof Todo) => {
  console.log('action: setting sort field', field);
  
  // Toggle direction if same field
  if (sortField() === field) {
    sortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  } else {
    sortField(field);
    sortDirection('asc');
  }
}, { name: 'setSortField' });

export const setSortDirection = action((direction: 'asc' | 'desc') => {
  console.log('action: setting sort direction', direction);
  sortDirection(direction);
}, { name: 'setSortDirection' });

export const resetSorting = action(() => {
  console.log('action: resetting sorting');
  sortField('createdAt');
  sortDirection('desc');
  sortPriority(0);
}, { name: 'resetSorting' });