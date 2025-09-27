// Search and pagination state
const searchQuery = state('', { name: 'searchQuery' });
const currentPage = state(1, { name: 'currentPage' });
const itemsPerPage = state(10, { name: 'itemsPerPage' });

// Debounced search
let searchTimeout: number | null = null;
export const debouncedSearch = action(
  (query: string) => {
    console.log('action: debounced search', query);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = window.setTimeout(() => {
      searchQuery(query);
      currentPage(1); // Reset to first page on search
    }, 300);
  },
  { name: 'debouncedSearch' },
);

// Search results
export const searchResults = derived(
  () => {
    const allTodos = todos();
    const query = searchQuery().toLowerCase();

    if (!query) return allTodos;

    return allTodos.filter(
      todo =>
        todo.text.toLowerCase().includes(query) ||
        todo.category.toLowerCase().includes(query),
    );
  },
  { name: 'searchResults' },
);

// Combined filtered and searched results
export const filteredAndSearchedTodos = derived(
  () => {
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
  },
  { name: 'filteredAndSearchedTodos' },
);

// Pagination
export const paginatedTodos = derived(
  () => {
    const filtered = filteredAndSearchedTodos();
    const page = currentPage();
    const perPage = itemsPerPage();

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return filtered.slice(startIndex, endIndex);
  },
  { name: 'paginatedTodos' },
);

// Pagination info
export const paginationInfo = derived(
  () => {
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
  },
  { name: 'paginationInfo' },
);

// Pagination actions
export const setPage = action(
  (page: number) => {
    console.log('action: setting page', page);
    const info = paginationInfo();

    if (page >= 1 && page <= info.totalPages) {
      currentPage(page);
    }
  },
  { name: 'setPage' },
);

export const nextPage = action(
  () => {
    console.log('action: next page');
    const info = paginationInfo();
    if (info.hasNextPage) {
      currentPage(prev => prev + 1);
    }
  },
  { name: 'nextPage' },
);

export const prevPage = action(
  () => {
    console.log('action: previous page');
    const info = paginationInfo();
    if (info.hasPrevPage) {
      currentPage(prev => prev - 1);
    }
  },
  { name: 'prevPage' },
);

export const setItemsPerPage = action(
  (perPage: number) => {
    console.log('action: setting items per page', perPage);
    itemsPerPage(perPage);
    currentPage(1); // Reset to first page
  },
  { name: 'setItemsPerPage' },
);
