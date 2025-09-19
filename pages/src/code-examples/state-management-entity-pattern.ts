import { state, action, batch } from 'react-understate';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

export const todos = state<Todo[]>([], { name: 'todos' });
export const selectedTodoId = state<string | null>(null, {
  name: 'selectedTodoId',
});

// Helper actions for complex operations
export const addTodo = action(
  (text: string) => {
    console.log('action: adding todo', text);

    const newTodo: Todo = {
      id: `todo-${Date.now()}`,
      text,
      completed: false,
      createdAt: new Date(),
    };

    todos(prev => [...prev, newTodo]);
  },
  { name: 'addTodo' },
);

export const updateTodo = action(
  (id: string, updates: Partial<Todo>) => {
    console.log('action: updating todo', id, updates);

    todos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, ...updates } : todo)),
    );
  },
  { name: 'updateTodo' },
);

export const deleteTodo = action(
  (id: string) => {
    console.log('action: deleting todo', id);

    todos(prev => prev.filter(todo => todo.id !== id));

    // Clear selection if deleted todo was selected
    if (selectedTodoId() === id) {
      selectedTodoId(null);
    }
  },
  { name: 'deleteTodo' },
);

export const toggleTodo = action(
  (id: string) => {
    console.log('action: toggling todo', id);

    updateTodo(id, {
      completed: !todos().find(t => t.id === id)?.completed,
    });
  },
  { name: 'toggleTodo' },
);

// Batch operations for performance
export const markAllCompleted = action(
  () => {
    console.log('action: marking all todos completed');

    batch(() => {
      todos(prev => prev.map(todo => ({ ...todo, completed: true })));
    });
  },
  { name: 'markAllCompleted' },
);

export const clearCompleted = action(
  () => {
    console.log('action: clearing completed todos');

    const completedIds = todos()
      .filter(t => t.completed)
      .map(t => t.id);

    batch(() => {
      todos(prev => prev.filter(todo => !todo.completed));

      // Clear selection if selected todo was completed
      if (selectedTodoId() && completedIds.includes(selectedTodoId()!)) {
        selectedTodoId(null);
      }
    });
  },
  { name: 'clearCompleted' },
);
