// Range filtering
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
}, { name: 'clearAllTags' });