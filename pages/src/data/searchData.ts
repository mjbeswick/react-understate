// Sample search data for React Understate documentation
// In a real implementation, this would be generated from your actual documentation content

export interface SearchDocument {
  objectID: string;
  title: string;
  content: string;
  path: string;
  section: string;
  hierarchy: {
    lvl0?: string;
    lvl1?: string;
    lvl2?: string;
  };
  type: 'page' | 'section' | 'api';
}

export const searchDocuments: SearchDocument[] = [
  {
    objectID: '1',
    title: 'Introduction',
    content:
      'A small, fast, and scalable state management solution for React. React Understate has a comfy API based on hooks and reactive primitives.',
    path: '/getting-started/introduction',
    section: 'Getting Started',
    hierarchy: {
      lvl0: 'Getting Started',
      lvl1: 'Introduction',
    },
    type: 'page',
  },
  {
    objectID: '2',
    title: 'Installation',
    content:
      'Install React Understate using npm, yarn, or pnpm. Get started quickly with your package manager of choice.',
    path: '/getting-started/installation',
    section: 'Getting Started',
    hierarchy: {
      lvl0: 'Getting Started',
      lvl1: 'Installation',
    },
    type: 'page',
  },
  {
    objectID: '3',
    title: 'Quick Start',
    content:
      'Learn the basics of React Understate with a simple counter example. Create your first reactive state in minutes.',
    path: '/getting-started/quick-start',
    section: 'Getting Started',
    hierarchy: {
      lvl0: 'Getting Started',
      lvl1: 'Quick Start',
    },
    type: 'page',
  },
  {
    objectID: '4',
    title: 'state()',
    content:
      'Create reactive state with the state() function. Accepts initial value and returns a reactive state object with get and set methods.',
    path: '/api/state',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'state()',
    },
    type: 'api',
  },
  {
    objectID: '5',
    title: 'derived()',
    content:
      'Create computed values with derived(). Automatically recomputes when dependencies change. Perfect for calculated state.',
    path: '/api/derived',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'derived()',
    },
    type: 'api',
  },
  {
    objectID: '6',
    title: 'effect()',
    content:
      'Handle side effects with effect(). Runs when dependencies change. Great for logging, API calls, and subscriptions.',
    path: '/api/effect',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'effect()',
    },
    type: 'api',
  },
  {
    objectID: '7',
    title: 'batch()',
    content:
      'Batch multiple state updates with batch(). Prevents unnecessary re-renders and improves performance.',
    path: '/api/batch',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'batch()',
    },
    type: 'api',
  },
  {
    objectID: '8',
    title: 'action()',
    content:
      'Create named functions that modify state. Actions provide enhanced performance tracking and better development experience.',
    path: '/api/action',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'action()',
    },
    type: 'api',
  },
  {
    objectID: '8b',
    title: 'useUnderstate()',
    content:
      'React hook for subscribing to state changes. Automatically re-renders components when subscribed state changes.',
    path: '/api/use-understate',
    section: 'API Reference',
    hierarchy: {
      lvl0: 'API Reference',
      lvl1: 'useUnderstate()',
    },
    type: 'api',
  },
  {
    objectID: '9',
    title: 'State Management',
    content:
      'Learn how to manage state effectively with React Understate. Best practices for organizing and structuring your state.',
    path: '/guides/state-management',
    section: 'Guides',
    hierarchy: {
      lvl0: 'Guides',
      lvl1: 'State Management',
    },
    type: 'page',
  },
  {
    objectID: '10',
    title: 'Derived Values',
    content:
      'Create computed state that automatically updates when dependencies change. Optimize performance with memoized calculations.',
    path: '/guides/derived-values',
    section: 'Guides',
    hierarchy: {
      lvl0: 'Guides',
      lvl1: 'Derived Values',
    },
    type: 'page',
  },
  {
    objectID: '11',
    title: 'Effects',
    content:
      'Handle side effects in your application. Learn when and how to use effects for API calls, logging, and subscriptions.',
    path: '/guides/effects',
    section: 'Guides',
    hierarchy: {
      lvl0: 'Guides',
      lvl1: 'Effects',
    },
    type: 'page',
  },
  {
    objectID: '12',
    title: 'Batching',
    content:
      'Improve performance by batching multiple state updates. Prevent unnecessary re-renders and optimize your app.',
    path: '/guides/batching',
    section: 'Guides',
    hierarchy: {
      lvl0: 'Guides',
      lvl1: 'Batching',
    },
    type: 'page',
  },
  {
    objectID: '13',
    title: 'Testing',
    content:
      'Test your React Understate code effectively. Mock states, simulate actions, and verify component behavior.',
    path: '/guides/testing',
    section: 'Guides',
    hierarchy: {
      lvl0: 'Guides',
      lvl1: 'Testing',
    },
    type: 'page',
  },
  {
    objectID: '14',
    title: 'Store Pattern',
    content:
      'Organize related state, actions, and derived values in a single module. Learn how to create maintainable stores.',
    path: '/patterns/store-pattern',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Store Pattern',
    },
    type: 'page',
  },
  {
    objectID: '15',
    title: 'Keyboard Shortcuts',
    content:
      'Handle keyboard input with effects and actions for better UX. Learn to create responsive keyboard interactions.',
    path: '/patterns/keyboard-shortcuts',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Keyboard Shortcuts',
    },
    type: 'page',
  },
  {
    objectID: '16',
    title: 'Local Storage',
    content:
      'Persist state to localStorage with automatic hydration. Keep user data across browser sessions.',
    path: '/patterns/local-storage',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Local Storage',
    },
    type: 'page',
  },
  {
    objectID: '17',
    title: 'Filtering & Sorting',
    content:
      'Use derived values for dynamic data filtering and sorting. Create responsive lists and tables.',
    path: '/patterns/filtering-sorting',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Filtering & Sorting',
    },
    type: 'page',
  },
  {
    objectID: '18',
    title: 'Async Data Loading',
    content:
      'Handle async operations with loading states and error handling. Manage remote data effectively.',
    path: '/patterns/async-data',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Async Data Loading',
    },
    type: 'page',
  },
  {
    objectID: '19',
    title: 'Form Validation',
    content:
      'Real-time form validation with derived state. Create responsive and user-friendly forms.',
    path: '/patterns/form-validation',
    section: 'Patterns',
    hierarchy: {
      lvl0: 'Patterns',
      lvl1: 'Form Validation',
    },
    type: 'page',
  },
];
