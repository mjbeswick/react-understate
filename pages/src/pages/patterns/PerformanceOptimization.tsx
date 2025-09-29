import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const PerformanceOptimization: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Performance Optimization</h1>
        <p className={styles.subtitle}>
          Optimize your React Understate applications for maximum performance
        </p>
      </header>

      <h2>Overview</h2>
      <p>
        React Understate is designed to be fast by default, but understanding
        performance patterns and optimization techniques will help you build
        even more efficient applications. This guide covers the most important
        performance considerations and patterns.
      </p>

      <div
        className="pattern-benefits"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>⚡ Key Performance Features</h3>
        <ul style={{ margin: 0 }}>
          <li>Automatic memoization of derived values</li>
          <li>Minimal re-renders with precise dependency tracking</li>
          <li>Efficient batching of state updates</li>
          <li>Lazy evaluation of derived values</li>
          <li>Reference equality for change detection</li>
        </ul>
      </div>

      <h2>State Structure Optimization</h2>

      <h3>Split Large Objects</h3>
      <p>
        For large objects, consider splitting into multiple states to minimize
        re-renders:
      </p>

      <CodeBlock
        language="tsx"
        code={`// ❌ One large state - changing name updates everything
const user = state({
  profile: { name: '', email: '', bio: '' },
  preferences: { theme: 'light', notifications: true },
  activities: [...], // Large array
  settings: { privacy: 'public', language: 'en' },
});

// ✅ Split into focused states
const userProfile = state({ name: '', email: '', bio: '' });
const userPreferences = state({ theme: 'light', notifications: true });
const userActivities = state([...]);
const userSettings = state({ privacy: 'public', language: 'en' });

// Components only re-render when their specific state changes
function ProfileComponent() {
  const [profile] = useUnderstate(userProfile);
  // Only re-renders when profile changes, not when preferences change
}

function PreferencesComponent() {
  const [preferences] = useUnderstate(userPreferences);
  // Only re-renders when preferences change, not when profile changes
}`}
      />

      <h3>Use Reference Equality</h3>
      <p>
        React Understate uses reference equality for change detection, so always
        replace objects instead of mutating them:
      </p>

      <CodeBlock
        language="tsx"
        code={`const settings = state({ theme: 'light', lang: 'en' });

// ❌ Wrong - mutating doesn't trigger updates
settings.value.theme = 'dark'; // Won't update components!

// ✅ Correct - replace the object
settings.value = { ...settings.value, theme: 'dark' };

// ✅ Also correct - completely new object
settings.value = { theme: 'dark', lang: 'en' };

// ✅ For arrays, use immutable operations
const items = state([1, 2, 3]);

// ❌ Wrong
items.value.push(4); // Won't trigger updates!

// ✅ Correct
items.value = [...items.value, 4];
items.value = items.value.filter(item => item !== 2);`}
      />

      <h2>Derived Value Optimization</h2>

      <h3>Minimize Dependencies</h3>
      <p>
        Only access the state values you actually need in derived functions:
      </p>

      <CodeBlock
        language="tsx"
        code={`// ❌ Inefficient - accesses entire user object
const userDisplay = derived(() => {
  const user = fullUserObject(); // Large object with many properties
  return \`\${user.firstName} \${user.lastName} (\${user.email})\`;
});

// ✅ Efficient - only depends on specific properties
const firstName = state('John');
const lastName = state('Doe');
const email = state('john@example.com');

const userDisplay = derived(() => {
  return \`\${firstName.value} \${lastName.value} (\${email.value})\`;
});`}
      />

      <h3>Use Intermediate Derived Values</h3>
      <p>
        Break down complex computations into smaller, reusable derived values:
      </p>

      <CodeBlock
        language="tsx"
        code={`const orders = state([]);

// Break down complex computation into steps
const validOrders = derived(() => {
  return orders.value.filter(order => order.status !== 'cancelled');
});

const ordersByMonth = derived(() => {
  const valid = validOrders.value;
  
  return valid.reduce((acc, order) => {
    const month = order.date.getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(order);
    return acc;
  }, {} as Record<number, Order[]>);
});

const monthlyRevenue = derived(() => {
  const byMonth = ordersByMonth.value;
  
  return Object.entries(byMonth).map(([month, orders]) => ({
    month: parseInt(month),
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
  }));
});`}
      />

      <h2>Batching for Performance</h2>

      <h3>Batch Multiple Updates</h3>
      <p>
        Use the <code>batch()</code> function to group multiple state updates
        and prevent unnecessary re-renders:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, batch, useUnderstate } from 'react-understate';

const firstName = state('');
const lastName = state('');
const email = state('');
const phone = state('');

// Without batching - triggers 4 re-renders
const updateUserUnbatched = (data) => {
  firstName.value = data.firstName;
  lastName.value = data.lastName;
  email.value = data.email;
  phone.value = data.phone;
};

// With batching - triggers only 1 re-render
const updateUserBatched = (data) => {
  batch(() => {
    firstName.value = data.firstName;
    lastName.value = data.lastName;
    email.value = data.email;
    phone.value = data.phone;
  });
};`}
      />

      <h3>Batch in Actions</h3>
      <p>Always use batching within actions to ensure optimal performance:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, action, batch } from 'react-understate';

const formData = state({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const updateForm = action((newData) => {
  batch(() => {
    formData.value = { ...formData.value, ...newData };
  });
}, 'updateForm');

const resetForm = action(() => {
  batch(() => {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
  });
}, 'resetForm');`}
      />

      <h2>Conditional Dependencies</h2>

      <p>
        Use conditional logic to avoid unnecessary computations and state
        access:
      </p>

      <CodeBlock
        language="tsx"
        code={`const showAdvancedStats = state(false);
const userData = state({ /* large user object */ });

// Only compute expensive stats when needed
const conditionalStats = derived(() => {
  const shouldShow = showAdvancedStats.value;
  
  if (!shouldShow) {
    return { enabled: false };
  }
  
  // Only access expensive data when actually needed
  const user = userData.value;
  return {
    enabled: true,
    totalOrders: user.orders.length,
    averageOrderValue: user.orders.reduce((sum, order) => sum + order.total, 0) / user.orders.length,
    // More expensive computations...
  };
});`}
      />

      <h2>Memory Management</h2>

      <h3>Clean Up Subscriptions</h3>
      <p>Always clean up subscriptions to prevent memory leaks:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, effect } from 'react-understate';

const data = state([]);

// Effect with proper cleanup
const dataEffect = effect(() => {
  const interval = setInterval(() => {
    // Update data periodically
    data.value = [...data.value, { id: Date.now(), value: Math.random() }];
  }, 1000);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
  };
}, 'dataEffect');

// Manual cleanup when needed
const cleanup = dataEffect;
// Later...
cleanup();`}
      />

      <h3>Use Weak References for Large Data</h3>
      <p>
        For very large datasets, consider using WeakMap or WeakSet to avoid
        memory leaks:
      </p>

      <CodeBlock
        language="tsx"
        code={`// For large datasets that might be garbage collected
const largeDataSet = new WeakMap();
const processedItems = new WeakSet();

const processLargeItem = (item) => {
  if (processedItems.has(item)) {
    return largeDataSet.get(item);
  }
  
  // Expensive processing...
  const result = expensiveProcessing(item);
  
  largeDataSet.set(item, result);
  processedItems.add(item);
  
  return result;
};`}
      />

      <h2>Performance Monitoring</h2>

      <h3>Custom Performance Monitoring</h3>
      <p>Add custom performance monitoring for critical operations:</p>

      <CodeBlock
        language="tsx"
        code={`const expensiveOperation = action(async (data) => {
  const startTime = performance.now();
  
  try {
    // Your expensive operation
    const result = await processLargeDataset(data);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 100) { // Log operations over 100ms
      console.warn(\`Slow operation: \${duration.toFixed(2)}ms\`);
    }
    
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}, 'expensiveOperation');`}
      />

      <h2>Best Practices Summary</h2>

      <ul>
        <li>
          <strong>Split large objects</strong> into focused state variables
        </li>
        <li>
          <strong>Use reference equality</strong> - always replace objects,
          never mutate
        </li>
        <li>
          <strong>Minimize dependencies</strong> in derived values
        </li>
        <li>
          <strong>Batch updates</strong> to prevent unnecessary re-renders
        </li>
        <li>
          <strong>Use conditional logic</strong> to avoid unnecessary
          computations
        </li>
        <li>
          <strong>Clean up subscriptions</strong> to prevent memory leaks
        </li>
        <li>
          <strong>Monitor performance</strong> in development
        </li>
      </ul>

      <h2>Next Steps</h2>
      <p>Continue exploring performance and optimization:</p>

      <div className={styles.navigation}>
        <Link to="/guides/batching" className={styles.navLink}>
          Batching Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/state-composition" className={styles.navLink}>
          State Composition
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/testing" className={styles.navLink}>
          Testing Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API Reference
        </Link>
      </div>
    </div>
  );
};

export default PerformanceOptimization;
