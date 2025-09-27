// Complex data structures
const todos = state<Todo[]>([], { name: 'todos' });
const filter = state<'all' | 'active' | 'completed'>('all', { name: 'filter' });
const searchTerm = state('', { name: 'searchTerm' });

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: Date;
};

// Filtered todos based on completion status
export const filteredTodos = derived(
  () => {
    const allTodos = todos();
    const currentFilter = filter();

    switch (currentFilter) {
      case 'active':
        return allTodos.filter(todo => !todo.completed);
      case 'completed':
        return allTodos.filter(todo => todo.completed);
      default:
        return allTodos;
    }
  },
  { name: 'filteredTodos' },
);

// Search functionality
export const searchedTodos = derived(
  () => {
    const filtered = filteredTodos();
    const search = searchTerm().toLowerCase();

    if (!search) return filtered;

    return filtered.filter(
      todo =>
        todo.text.toLowerCase().includes(search) ||
        todo.tags.some(tag => tag.toLowerCase().includes(search)),
    );
  },
  { name: 'searchedTodos' },
);

// Sorted todos with priority and due date
export const sortedTodos = derived(
  () => {
    const searched = searchedTodos();

    return [...searched].sort((a, b) => {
      // First by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Finally by creation order (assuming id contains timestamp)
      return a.id.localeCompare(b.id);
    });
  },
  { name: 'sortedTodos' },
);

// Statistics derived from todos
export const todoStats = derived(
  () => {
    const allTodos = todos();

    const total = allTodos.length;
    const completed = allTodos.filter(t => t.completed).length;
    const active = total - completed;

    const byPriority = allTodos.reduce(
      (acc, todo) => {
        acc[todo.priority] = (acc[todo.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const overdue = allTodos.filter(
      todo => todo.dueDate && todo.dueDate < new Date() && !todo.completed,
    ).length;

    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? completed / total : 0,
      byPriority,
      overdue,
    };
  },
  { name: 'todoStats' },
);
