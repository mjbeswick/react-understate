# React Understate Todo App Example

This example demonstrates the React Understate library with a classic Todo application. It showcases reactive state management, computed values, and UI updates using signals.

## Features

- ✅ Add new todos
- ✅ Mark todos as complete/incomplete
- ✅ Filter todos (All, Active, Completed)
- ✅ Delete individual todos
- ✅ Clear all completed todos
- ✅ Toggle all todos at once
- ✅ Real-time counter of active items

## Key Concepts Demonstrated

### 1. Signal State Management

```tsx
const todos = state<Todo[]>([]);
const filter = state<"all" | "active" | "completed">("all");
const newTodo = state("");
```

### 2. Computed Values

```tsx
const filteredTodos = computed(() => {
  const allTodos = todos.value;
  const currentFilter = filter.value;
  // Filter logic...
});

const activeCount = computed(
  () => todos.value.filter((todo) => !todo.completed).length,
);
```

### 3. React Integration

```tsx
function TodoApp() {
  useSubscribe(todos);
  useSubscribe(filter);
  useSubscribe(filteredTodos);
  // Component logic...
}
```

## Running the Example

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to the provided URL (typically http://localhost:5173)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Architecture

- **State**: Three main signals store the application state
- **Computed Values**: Derived state that automatically updates when dependencies change
- **UI**: React components that subscribe to signals and re-render when state changes
- **Styling**: CSS modules for scoped styling following TodoMVC design patterns

This example follows the classic TodoMVC specification and demonstrates how signals can provide a clean, reactive state management solution for React applications.
