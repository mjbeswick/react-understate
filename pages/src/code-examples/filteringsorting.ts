import { state, derived, action } from 'react-understate';

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
const filterCompleted = state<'all' | 'active' | 'completed'>('all', {
  name: 'filterCompleted',
});
const filterCategory = state<string>('all', { name: 'filterCategory' });

// Derived filtered todos
export const filteredTodos = derived(
  () => {
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
  },
  { name: 'filteredTodos' },
);

// Actions for updating filters
export const setFilterText = action(
  (text: string) => {
    console.log('action: setting filter text', text);
    filterText(text);
  },
  { name: 'setFilterText' },
);

export const setFilterCompleted = action(
  (filter: 'all' | 'active' | 'completed') => {
    console.log('action: setting completed filter', filter);
    filterCompleted(filter);
  },
  { name: 'setFilterCompleted' },
);

export const setFilterCategory = action(
  (category: string) => {
    console.log('action: setting category filter', category);
    filterCategory(category);
  },
  { name: 'setFilterCategory' },
);

export const clearFilters = action(
  () => {
    console.log('action: clearing all filters');
    filterText('');
    filterCompleted('all');
    filterCategory('all');
  },
  { name: 'clearFilters' },
);
