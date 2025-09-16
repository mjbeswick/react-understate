import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const FilteringSorting: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Filtering & Sorting</h1>
        <p className={styles.subtitle}>
          Build powerful data filtering and sorting with derived values
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Pattern:</span>
          <Link to="/patterns" className={styles.navLink}>
            Patterns
          </Link>
          <span className={styles.navLabel}>/</span>
          <span>Filtering & Sorting</span>
        </div>
      </nav>

      <h2>Overview</h2>
      <p>
        Filtering and sorting are common patterns in data-driven applications.
        React Understate makes it easy to build reactive filtering and sorting
        that automatically updates when data or criteria change.
      </p>

      <div
        className="pattern-benefits"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Key Features</h3>
        <ul style={{ margin: 0 }}>
          <li>Reactive filtering with derived values</li>
          <li>Multiple filter criteria support</li>
          <li>Flexible sorting options</li>
          <li>Performance optimization</li>
          <li>Search and pagination</li>
          <li>Type-safe filtering</li>
        </ul>
      </div>

      <h2>Basic Filtering Pattern</h2>
      <p>Start with a simple filtering pattern using derived values:</p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action } from 'react-understate';

// Data types
type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
};

// State
const todos = state<Todo[]>([], { name: 'todos' });
const filterText = state('', { name: 'filterText' });
const filterCompleted = state<'all' | 'active' | 'completed'>('all', { name: 'filterCompleted' });
const filterCategory = state<string>('all', { name: 'filterCategory' });

// Derived filtered todos
export const filteredTodos = derived(() => {
  const allTodos = todos();
  const text = filterText().toLowerCase();
  const completed = filterCompleted();
  const category = filterCategory();
  
  return allTodos.filter(todo => {
    // Text filter
    if (text && !todo.text.toLowerCase().includes(text)) {
      return false;
    }
    
    // Completion filter
    if (completed === 'active' && todo.completed) return false;
    if (completed === 'completed' && !todo.completed) return false;
    
    // Category filter
    if (category !== 'all' && todo.category !== category) {
      return false;
    }
    
    return true;
  });
}, { name: 'filteredTodos' });

// Actions for updating filters
export const setFilterText = action((text: string) => {
  console.log('action: setting filter text', text);
  filterText(text);
}, { name: 'setFilterText' });

export const setFilterCompleted = action((filter: 'all' | 'active' | 'completed') => {
  console.log('action: setting completed filter', filter);
  filterCompleted(filter);
}, { name: 'setFilterCompleted' });

export const setFilterCategory = action((category: string) => {
  console.log('action: setting category filter', category);
  filterCategory(category);
}, { name: 'setFilterCategory' });

export const clearFilters = action(() => {
  console.log('action: clearing all filters');
  filterText('');
  filterCompleted('all');
  filterCategory('all');
}, { name: 'clearFilters' });`}
      />

      <h2>Advanced Sorting</h2>
      <p>Add flexible sorting capabilities with multiple sort criteria:</p>

      <CodeBlock
        language="typescript"
        code={`// Sorting state
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
}, { name: 'resetSorting' });`}
      />

      <h2>Search and Pagination</h2>
      <p>Combine filtering with search and pagination for large datasets:</p>

      <CodeBlock
        language="typescript"
        code={`// Search and pagination state
const searchQuery = state('', { name: 'searchQuery' });
const currentPage = state(1, { name: 'currentPage' });
const itemsPerPage = state(10, { name: 'itemsPerPage' });

// Debounced search
let searchTimeout: number | null = null;
export const debouncedSearch = action((query: string) => {
  console.log('action: debounced search', query);
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = window.setTimeout(() => {
    searchQuery(query);
    currentPage(1); // Reset to first page on search
  }, 300);
}, { name: 'debouncedSearch' });

// Search results
export const searchResults = derived(() => {
  const allTodos = todos();
  const query = searchQuery().toLowerCase();
  
  if (!query) return allTodos;
  
  return allTodos.filter(todo => 
    todo.text.toLowerCase().includes(query) ||
    todo.category.toLowerCase().includes(query)
  );
}, { name: 'searchResults' });

// Combined filtered and searched results
export const filteredAndSearchedTodos = derived(() => {
  const searched = searchResults();
  const text = filterText().toLowerCase();
  const completed = filterCompleted();
  const category = filterCategory();
  
  return searched.filter(todo => {
    if (text && !todo.text.toLowerCase().includes(text)) return false;
    if (completed === 'active' && todo.completed) return false;
    if (completed === 'completed' && !todo.completed) return false;
    if (category !== 'all' && todo.category !== category) return false;
    return true;
  });
}, { name: 'filteredAndSearchedTodos' });

// Pagination
export const paginatedTodos = derived(() => {
  const filtered = filteredAndSearchedTodos();
  const page = currentPage();
  const perPage = itemsPerPage();
  
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return filtered.slice(startIndex, endIndex);
}, { name: 'paginatedTodos' });

// Pagination info
export const paginationInfo = derived(() => {
  const filtered = filteredAndSearchedTodos();
  const page = currentPage();
  const perPage = itemsPerPage();
  
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / perPage);
  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalItems);
  
  return {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: perPage,
    startIndex,
    endIndex,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}, { name: 'paginationInfo' });

// Pagination actions
export const setPage = action((page: number) => {
  console.log('action: setting page', page);
  const info = paginationInfo();
  
  if (page >= 1 && page <= info.totalPages) {
    currentPage(page);
  }
}, { name: 'setPage' });

export const nextPage = action(() => {
  console.log('action: next page');
  const info = paginationInfo();
  if (info.hasNextPage) {
    currentPage(prev => prev + 1);
  }
}, { name: 'nextPage' });

export const prevPage = action(() => {
  console.log('action: previous page');
  const info = paginationInfo();
  if (info.hasPrevPage) {
    currentPage(prev => prev - 1);
  }
}, { name: 'prevPage' });

export const setItemsPerPage = action((perPage: number) => {
  console.log('action: setting items per page', perPage);
  itemsPerPage(perPage);
  currentPage(1); // Reset to first page
}, { name: 'setItemsPerPage' });`}
      />

      <h2>Advanced Filtering Patterns</h2>
      <p>
        More sophisticated filtering patterns for complex data requirements:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Range filtering
const dateRange = state<{ start: Date | null; end: Date | null }>({
  start: null,
  end: null,
}, { name: 'dateRange' });

const priorityRange = state<{ min: number; max: number }>({
  min: 1,
  max: 3,
}, { name: 'priorityRange' });

// Tag-based filtering
const selectedTags = state<string[]>([], { name: 'selectedTags' });
const availableTags = derived(() => {
  const allTodos = todos();
  const tags = new Set<string>();
  
  allTodos.forEach(todo => {
    if (todo.tags) {
      todo.tags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags).sort();
}, { name: 'availableTags' });

// Advanced filtered todos
export const advancedFilteredTodos = derived(() => {
  const allTodos = todos();
  const text = filterText().toLowerCase();
  const completed = filterCompleted();
  const category = filterCategory();
  const dateRangeValue = dateRange();
  const priorityRangeValue = priorityRange();
  const tags = selectedTags();
  
  return allTodos.filter(todo => {
    // Text filter
    if (text && !todo.text.toLowerCase().includes(text)) return false;
    
    // Completion filter
    if (completed === 'active' && todo.completed) return false;
    if (completed === 'completed' && !todo.completed) return false;
    
    // Category filter
    if (category !== 'all' && todo.category !== category) return false;
    
    // Date range filter
    if (dateRangeValue.start && todo.createdAt < dateRangeValue.start) return false;
    if (dateRangeValue.end && todo.createdAt > dateRangeValue.end) return false;
    
    // Priority range filter
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const todoPriority = priorityOrder[todo.priority];
    if (todoPriority < priorityRangeValue.min || todoPriority > priorityRangeValue.max) {
      return false;
    }
    
    // Tag filter
    if (tags.length > 0 && todo.tags) {
      const hasMatchingTag = tags.some(tag => todo.tags!.includes(tag));
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });
}, { name: 'advancedFilteredTodos' });

// Filter actions
export const setDateRange = action((start: Date | null, end: Date | null) => {
  console.log('action: setting date range', { start, end });
  dateRange({ start, end });
}, { name: 'setDateRange' });

export const setPriorityRange = action((min: number, max: number) => {
  console.log('action: setting priority range', { min, max });
  priorityRange({ min, max });
}, { name: 'setPriorityRange' });

export const toggleTag = action((tag: string) => {
  console.log('action: toggling tag', tag);
  selectedTags(prev => 
    prev.includes(tag) 
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
  );
}, { name: 'toggleTag' });

export const selectAllTags = action(() => {
  console.log('action: selecting all tags');
  const tags = availableTags();
  selectedTags(tags);
}, { name: 'selectAllTags' });

export const clearAllTags = action(() => {
  console.log('action: clearing all tags');
  selectedTags([]);
}, { name: 'clearAllTags' });`}
      />

      <h2>Performance Optimization</h2>
      <p>Optimize filtering and sorting performance for large datasets:</p>

      <CodeBlock
        language="typescript"
        code={`// Memoized filtering for expensive operations
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
);`}
      />

      <h2>Using in React Components</h2>
      <p>
        Here's how to use filtering and sorting patterns in React components:
      </p>

      <CodeBlock
        language="tsx"
        code={`import React from 'react';
import { useUnderstate } from 'react-understate';
import {
  filteredTodos,
  sortedTodos,
  paginatedTodos,
  paginationInfo,
  setFilterText,
  setFilterCompleted,
  setSortField,
  setPage,
  nextPage,
  prevPage,
} from './todoStore';

function TodoList() {
  const todos = useUnderstate(paginatedTodos);
  const pagination = useUnderstate(paginationInfo);
  const filterText = useUnderstate(filterText);
  const filterCompleted = useUnderstate(filterCompleted);
  const sortField = useUnderstate(sortField);

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search todos..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        
        <select
          value={filterCompleted}
          onChange={(e) => setFilterCompleted(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Sort controls */}
      <div className="sort-controls">
        <button onClick={() => setSortField('text')}>
          Sort by Text {sortField === 'text' ? '↑' : ''}
        </button>
        <button onClick={() => setSortField('createdAt')}>
          Sort by Date {sortField === 'createdAt' ? '↑' : ''}
        </button>
        <button onClick={() => setSortField('priority')}>
          Sort by Priority {sortField === 'priority' ? '↑' : ''}
        </button>
      </div>

      {/* Todo list */}
      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className="todo-item">
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <span className="priority">{todo.priority}</span>
            <span className="category">{todo.category}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={prevPage} 
          disabled={!pagination.hasPrevPage}
        >
          Previous
        </button>
        
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
          ({pagination.startIndex}-{pagination.endIndex} of {pagination.totalItems})
        </span>
        
        <button 
          onClick={nextPage} 
          disabled={!pagination.hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Advanced filtering component
function AdvancedFilters() {
  const selectedTags = useUnderstate(selectedTags);
  const availableTags = useUnderstate(availableTags);
  const dateRange = useUnderstate(dateRange);
  const priorityRange = useUnderstate(priorityRange);

  return (
    <div className="advanced-filters">
      {/* Tag filters */}
      <div className="tag-filters">
        <h3>Tags</h3>
        {availableTags.map(tag => (
          <label key={tag}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleTag(tag)}
            />
            {tag}
          </label>
        ))}
      </div>

      {/* Date range */}
      <div className="date-range">
        <h3>Date Range</h3>
        <input
          type="date"
          value={dateRange.start?.toISOString().split('T')[0] || ''}
          onChange={(e) => setDateRange(
            e.target.value ? new Date(e.target.value) : null,
            dateRange.end
          )}
        />
        <input
          type="date"
          value={dateRange.end?.toISOString().split('T')[0] || ''}
          onChange={(e) => setDateRange(
            dateRange.start,
            e.target.value ? new Date(e.target.value) : null
          )}
        />
      </div>

      {/* Priority range */}
      <div className="priority-range">
        <h3>Priority Range</h3>
        <input
          type="range"
          min="1"
          max="3"
          value={priorityRange.min}
          onChange={(e) => setPriorityRange(
            parseInt(e.target.value),
            priorityRange.max
          )}
        />
        <input
          type="range"
          min="1"
          max="3"
          value={priorityRange.max}
          onChange={(e) => setPriorityRange(
            priorityRange.min,
            parseInt(e.target.value)
          )}
        />
      </div>
    </div>
  );
}

export { TodoList, AdvancedFilters };`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Use derived values:</strong> Let React Understate handle
          reactivity automatically
        </li>
        <li>
          <strong>Debounce search:</strong> Prevent excessive filtering on every
          keystroke
        </li>
        <li>
          <strong>Memoize expensive operations:</strong> Cache results for
          complex filtering
        </li>
        <li>
          <strong>Combine filters efficiently:</strong> Use early returns to
          avoid unnecessary checks
        </li>
        <li>
          <strong>Provide clear feedback:</strong> Show filter counts and active
          filters
        </li>
        <li>
          <strong>Handle edge cases:</strong> Empty results, invalid filters,
          etc.
        </li>
        <li>
          <strong>Use TypeScript:</strong> Ensure type safety for filter
          criteria
        </li>
        <li>
          <strong>Test thoroughly:</strong> Filtering logic can be complex and
          error-prone
        </li>
      </ul>

      <h2>Related Patterns</h2>
      <div className={styles.navigation}>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/derived-values" className={styles.navLink}>
          Derived Values Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/derived" className={styles.navLink}>
          derived() API
        </Link>
      </div>
    </div>
  );
};

export default FilteringSorting;
