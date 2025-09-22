import { arrayState } from 'react-understate';

// Basic array state usage
const todos = arrayState<string>(['Learn React', 'Build app'], {
  name: 'todos',
});

// Mutating methods that trigger subscriptions
todos.push('Deploy app'); // ['Learn React', 'Build app', 'Deploy app']
todos.pop(); // ['Learn React', 'Build app']
todos.unshift('Plan project'); // ['Plan project', 'Learn React', 'Build app']
todos.splice(1, 1, 'Learn TypeScript'); // ['Plan project', 'Learn TypeScript', 'Build app']

// Non-mutating methods (don't trigger subscriptions)
const completed = todos.filter(todo => todo.includes('Learn')); // ['Learn TypeScript']
const joined = todos.join(', '); // 'Plan project, Learn TypeScript, Build app'
const first = todos.at(0); // 'Plan project'
const last = todos.at(-1); // 'Build app'

// Subscribe to changes
todos.subscribe(() => {
  console.log('Todos changed:', todos.value);
});

// Utility methods
todos.clear(); // []
todos.set(['New task 1', 'New task 2']); // ['New task 1', 'New task 2']

// Batch operations
todos.batch(arr => {
  arr.push('Task 3');
  arr.push('Task 4');
  arr.sort(); // Sorts in place
}); // ['New task 1', 'New task 2', 'Task 3', 'Task 4']

export { todos };
