import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const DerivedValues: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Derived Values Guide</h1>
        <p className={styles.subtitle}>
          Master computed state and reactive programming with derived values
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/derived-values" className={styles.navLink}>
            Derived Values
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        Derived values are computed state that automatically updates when their
        dependencies change. They're the foundation of reactive programming in
        React Understate, enabling you to build complex data flows with simple,
        composable building blocks.
      </p>

      <div
        className="guide-overview"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>🎯 What You'll Learn</h3>
        <ul style={{ margin: 0 }}>
          <li>Creating and composing derived values</li>
          <li>Performance optimization techniques</li>
          <li>Advanced dependency management</li>
          <li>Async derived values and caching</li>
          <li>Common patterns and best practices</li>
          <li>Debugging and development tools</li>
        </ul>
      </div>

      <h2>Basic Derived Values</h2>
      <p>
        The `derived()` function creates computed state that automatically
        recalculates when its dependencies change.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived } from 'react-understate';

// Basic state
const firstName = state('John', { name: 'firstName' });
const lastName = state('Doe', { name: 'lastName' });
const age = state(30, { name: 'age' });

// Simple derived values
export const fullName = derived(() => {
  return \`\${firstName()} \${lastName()}\`;
}, { name: 'fullName' });

export const isAdult = derived(() => {
  return age() >= 18;
}, { name: 'isAdult' });

export const greeting = derived(() => {
  const name = fullName();
  const adult = isAdult();
  return \`Hello, \${name}! You are \${adult ? 'an adult' : 'a minor'}.\`;
}, { name: 'greeting' });

// Derived values automatically update when dependencies change
firstName('Jane'); // fullName and greeting automatically update
age(16);           // isAdult and greeting automatically update`}
      />

      <h2>Complex Computations</h2>
      <p>
        Derived values can perform complex calculations, data transformations,
        and aggregations while maintaining excellent performance through
        automatic memoization.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Complex data structures
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
export const filteredTodos = derived(() => {
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
}, { name: 'filteredTodos' });

// Search functionality
export const searchedTodos = derived(() => {
  const filtered = filteredTodos();
  const search = searchTerm().toLowerCase();
  
  if (!search) return filtered;
  
  return filtered.filter(todo =>
    todo.text.toLowerCase().includes(search) ||
    todo.tags.some(tag => tag.toLowerCase().includes(search))
  );
}, { name: 'searchedTodos' });

// Sorted todos with priority and due date
export const sortedTodos = derived(() => {
  const searched = searchedTodos();
  
  return [...searched].sort((a, b) => {
    // First by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
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
}, { name: 'sortedTodos' });

// Statistics derived from todos
export const todoStats = derived(() => {
  const allTodos = todos();
  
  const total = allTodos.length;
  const completed = allTodos.filter(t => t.completed).length;
  const active = total - completed;
  
  const byPriority = allTodos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const overdue = allTodos.filter(todo => 
    todo.dueDate && todo.dueDate < new Date() && !todo.completed
  ).length;
  
  return {
    total,
    completed,
    active,
    completionRate: total > 0 ? completed / total : 0,
    byPriority,
    overdue,
  };
}, { name: 'todoStats' });`}
      />

      <h2>Performance Optimization</h2>
      <p>
        Derived values are automatically memoized, but you can optimize
        performance further with strategic dependency management and caching.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Minimize dependencies by splitting computations
// ❌ Inefficient: Recomputes everything when any user property changes
const inefficientUserDisplay = derived(() => {
  const user = fullUserObject(); // Large object with many properties
  return \`\${user.firstName} \${user.lastName} (\${user.email})\`;
}, { name: 'inefficientUserDisplay' });

// ✅ Efficient: Only depends on specific properties
const efficientUserDisplay = derived(() => {
  const first = firstName();
  const last = lastName();
  const email = userEmail();
  return \`\${first} \${last} (\${email})\`;
}, { name: 'efficientUserDisplay' });

// 2. Use intermediate derived values for complex chains
const userOrders = state<Order[]>([], { name: 'userOrders' });

// Break down complex computation into steps
export const validOrders = derived(() => {
  return userOrders().filter(order => order.status !== 'cancelled');
}, { name: 'validOrders' });

export const ordersByMonth = derived(() => {
  const valid = validOrders();
  
  return valid.reduce((acc, order) => {
    const month = order.date.getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(order);
    return acc;
  }, {} as Record<number, Order[]>);
}, { name: 'ordersByMonth' });

export const monthlyRevenue = derived(() => {
  const byMonth = ordersByMonth();
  
  return Object.entries(byMonth).map(([month, orders]) => ({
    month: parseInt(month),
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
  }));
}, { name: 'monthlyRevenue' });

// 3. Conditional dependencies for better performance
const showAdvancedStats = state(false, { name: 'showAdvancedStats' });

export const conditionalStats = derived(() => {
  const shouldShow = showAdvancedStats();
  
  if (!shouldShow) {
    // Don't access expensive data when not needed
    return { enabled: false };
  }
  
  // Only compute when actually needed
  const stats = todoStats();
  const revenue = monthlyRevenue();
  
  return {
    enabled: true,
    ...stats,
    revenue,
    // More expensive computations...
  };
}, { name: 'conditionalStats' });`}
      />

      <h2>Best Practices</h2>
      <p>
        Follow these best practices to get the most out of derived values in
        your applications.
      </p>

      <CodeBlock
        language="typescript"
        code={`// ✅ DO: Keep derived functions pure
const goodDerived = derived(() => {
  const items = items();
  return items.filter(item => item.active).length;
}, { name: 'activeItemCount' });

// ❌ DON'T: Cause side effects in derived functions
const badDerived = derived(() => {
  const count = items().length;
  
  // Side effects! Don't do this
  localStorage.setItem('itemCount', count.toString());
  updateAnalytics('itemCountChanged', count);
  
  return count;
}, { name: 'badDerived' });

// ✅ DO: Use descriptive names
const userDisplayName = derived(() => {
  const user = currentUser();
  return user.preferredName || \`\${user.firstName} \${user.lastName}\`;
}, { name: 'userDisplayName' });

// ✅ DO: Split complex computations into smaller pieces
const validItems = derived(() => {
  return items().filter(item => item.isValid);
}, { name: 'validItems' });

const sortedValidItems = derived(() => {
  return validItems().sort((a, b) => a.priority - b.priority);
}, { name: 'sortedValidItems' });

const displayItems = derived(() => {
  return sortedValidItems().slice(0, 10);
}, { name: 'displayItems' });`}
      />

      <h2>Next Steps</h2>
      <p>
        Now that you understand derived values, explore these related topics:
      </p>

      <div className={styles.navigation}>
        <Link to="/guides/effects" className={styles.navLink}>
          Effects Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/batching" className={styles.navLink}>
          Batching Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/derived" className={styles.navLink}>
          derived() API Reference
        </Link>
      </div>
    </div>
  );
};

export default DerivedValues;
