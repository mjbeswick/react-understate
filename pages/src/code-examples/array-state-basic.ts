import { state } from 'react-understate';

// Basic array state usage
const todos = state<string[]>(['Learn React', 'Build app'], {
  name: 'todos',
  observeMutations: true,
});

// Mutating methods that trigger subscriptions
todos.value.push('Deploy app'); // ['Learn React', 'Build app', 'Deploy app']
todos.value.pop(); // ['Learn React', 'Build app']
todos.value.unshift('Plan project'); // ['Plan project', 'Learn React', 'Build app']
todos.value.splice(1, 1, 'Learn TypeScript'); // ['Plan project', 'Learn TypeScript', 'Build app']

// Non-mutating methods (don't trigger subscriptions)
const completed = todos.value.filter(todo => todo.includes('Learn')); // ['Learn TypeScript']
const joined = todos.value.join(', '); // 'Plan project, Learn TypeScript, Build app'
const first = todos.value.at(0); // 'Plan project'
const last = todos.value.at(-1); // 'Build app'

// Subscribe to changes
todos.subscribe(() => {
  console.log('Todos changed:', todos.value);
});

// Utility methods
todos.clear(); // []
// Replace entire array via value
todos.value = ['New task 1', 'New task 2']; // ['New task 1', 'New task 2']
// Set a specific item by index
todos.value[1] = 'Relearn TypeScript'; // ['New task 1', 'Relearn TypeScript']

// Batch operations
// Use batch from core if needed for grouping unrelated states; array mutators already batch at state-level

export { todos };
