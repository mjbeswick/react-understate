import { state, derived, action, batch, useUnderstate } from 'react-understate';
import React from 'react';

// 1. Granular subscriptions
const user = state({ name: 'John', email: 'john@example.com' }, { name: 'user' });

// ❌ Avoid: Subscribing to entire large objects
export function BadUserProfile() {
  const userData = useUnderstate(user); // Re-renders on any user property change
  return <h1>{userData.name}</h1>; // Only needs name
}

// ✅ Good: Subscribe to specific properties
export const userName = derived(() => user().name, { name: 'userName' });

export function GoodUserProfile() {
  const name = useUnderstate(userName); // Only re-renders when name changes
  return <h1>{name}</h1>;
}

// 2. Memoized selectors for expensive computations
const largeDataSet = state<Array<{ id: number; name: string; category: string; active: boolean; priority: number }>>([], { name: 'largeDataSet' });

export const expensiveComputation = derived(() => {
  const data = largeDataSet();
  
  // Expensive calculation only runs when data changes
  return data
    .filter(item => item.active)
    .sort((a, b) => b.priority - a.priority)
    .map(item => ({
      ...item,
      displayName: `${item.name} (${item.category})`,
    }));
}, { name: 'expensiveComputation' });

// 3. Conditional subscriptions
const shouldShowList = state(true, { name: 'shouldShowList' });
const expensiveItems = derived(() => expensiveComputation(), { name: 'expensiveItems' });

export function ConditionalList() {
  const showList = useUnderstate(shouldShowList);
  
  // Only subscribe to items when list is visible
  const items = useUnderstate(showList ? expensiveItems : state([]));
  
  return showList ? (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  ) : null;
}

// 4. Batching updates for better performance
const todos = state<Array<{ id: string; text: string }>>([], { name: 'todos' });
const uiSettings = state({ theme: 'light' as 'light' | 'dark' }, { name: 'uiSettings' });

export const batchedUpdate = action(() => {
  console.log('action: performing batched update');
  
  batch(() => {
    // All these updates are batched into a single re-render
    user(prev => ({ ...prev, name: 'New Name' }));
    user(prev => ({ ...prev, email: 'new@email.com' }));
    todos(prev => [...prev, { id: `${Date.now()}`, text: 'New todo' }]);
    uiSettings(prev => ({ ...prev, theme: 'dark' }));
  });
}, { name: 'batchedUpdate' });

// 5. Lazy initialization for expensive default values
export const expensiveState = state(() => {
  // This function only runs once, when state is first accessed
  console.log('Initializing expensive state...');
  return performExpensiveCalculation();
}, { name: 'expensiveState' });

function performExpensiveCalculation() {
  let sum = 0;
  for (let i = 0; i < 10000; i++) sum += i;
  return sum;
}

// 6. State splitting for large lists
export const createPaginatedState = <T,>(pageSize = 50) => {
  const allItems = state<T[]>([], { name: 'allItems' });
  const currentPage = state(0, { name: 'currentPage' });
  
  const totalPages = derived(() => 
    Math.ceil(allItems().length / pageSize)
  , { name: 'totalPages' });
  
  const currentPageItems = derived(() => {
    const items = allItems();
    const page = currentPage();
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, { name: 'currentPageItems' });
  
  return {
    allItems,
    currentPage,
    totalPages,
    currentPageItems,
    pageSize,
  };
};


