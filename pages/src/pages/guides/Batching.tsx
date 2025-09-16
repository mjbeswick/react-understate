import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const Batching: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Batching Guide</h1>
        <p className={styles.subtitle}>
          Optimize performance with automatic and manual state batching
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Guide:</span>
          <Link to="/guides/batching" className={styles.navLink}>
            Batching
          </Link>
        </div>
      </nav>

      <h2>Introduction</h2>
      <p>
        Batching is a performance optimization technique that groups multiple
        state updates together to minimize re-renders and improve application
        performance. React Understate provides both automatic and manual
        batching capabilities.
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
          <li>Understanding automatic batching</li>
          <li>Using manual batching with batch()</li>
          <li>Performance optimization strategies</li>
          <li>Common batching patterns</li>
          <li>Debugging and monitoring</li>
          <li>Best practices and anti-patterns</li>
        </ul>
      </div>

      <h2>Automatic Batching</h2>
      <p>
        React Understate automatically batches state updates that occur within
        the same execution context, such as event handlers, effects, and
        actions.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, action } from 'react-understate';

// Multiple state atoms
const count = state(0, { name: 'count' });
const name = state('', { name: 'name' });
const isVisible = state(false, { name: 'isVisible' });

// Automatic batching in event handlers
function handleButtonClick() {
  // These three updates are automatically batched
  count(prev => prev + 1);
  name('Button clicked');
  isVisible(true);
  // Only one re-render will occur
}

// Automatic batching in actions
export const updateUserProfile = action((userData: UserData) => {
  console.log('action: updating user profile');
  
  // All these updates are batched together
  name(userData.name);
  email(userData.email);
  avatar(userData.avatar);
  preferences(userData.preferences);
  
  // Only one re-render for all updates
}, { name: 'updateUserProfile' });

// Automatic batching in effects
export const syncEffect = effect(() => {
  const data = externalData();
  
  if (data) {
    // These updates are batched
    processData(data);
    updateCache(data);
    notifySubscribers(data);
  }
}, { name: 'syncEffect' });`}
      />

      <h2>Manual Batching</h2>
      <p>
        For more control over when batching occurs, use the `batch()` function
        to explicitly group updates together.
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, batch, action } from 'react-understate';

// Manual batching for complex operations
export const complexUpdate = action(() => {
  console.log('action: performing complex update');
  
  batch(() => {
    // All updates inside batch() are grouped together
    user(prev => ({ ...prev, name: 'John' }));
    settings(prev => ({ ...prev, theme: 'dark' }));
    notifications(prev => ({ ...prev, enabled: true }));
    
    // Derived values won't recalculate until batch completes
    const userDisplay = \`\${user().name} - \${settings().theme}\`;
    console.log('User display:', userDisplay);
  });
  
  // Re-renders happen after batch completes
}, { name: 'complexUpdate' });

// Nested batching
export const nestedBatching = action(() => {
  console.log('action: nested batching example');
  
  batch(() => {
    // First batch
    count(1);
    name('First');
    
    batch(() => {
      // Nested batch - still part of the outer batch
      count(2);
      name('Second');
      
      batch(() => {
        // Deeply nested - still batched
        count(3);
        name('Third');
      });
    });
    
    // This is also part of the outer batch
    isVisible(true);
  });
  
  // All updates are batched together, only one re-render
}, { name: 'nestedBatching' });

// Conditional batching
export const conditionalBatching = action((shouldBatch: boolean) => {
  console.log('action: conditional batching', shouldBatch);
  
  if (shouldBatch) {
    batch(() => {
      updateMultipleStates();
    });
  } else {
    // Updates happen individually
    updateMultipleStates();
  }
}, { name: 'conditionalBatching' });

function updateMultipleStates() {
  state1('value1');
  state2('value2');
  state3('value3');
}`}
      />

      <h2>Performance Optimization</h2>
      <p>
        Strategic use of batching can significantly improve performance,
        especially in complex applications with many state updates.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Bulk data loading
export const loadBulkData = action(async (data: BulkData) => {
  console.log('action: loading bulk data');
  
  // Without batching - multiple re-renders
  // users(data.users);
  // posts(data.posts);
  // comments(data.comments);
  // settings(data.settings);
  
  // With batching - single re-render
  batch(() => {
    users(data.users);
    posts(data.posts);
    comments(data.comments);
    settings(data.settings);
  });
}, { name: 'loadBulkData' });

// 2. Form validation updates
export const validateForm = action((formData: FormData) => {
  console.log('action: validating form');
  
  const errors = validateFormData(formData);
  
  batch(() => {
    // Update all validation states at once
    formErrors(errors);
    fieldErrors(errors.fieldErrors);
    isValid(Object.keys(errors).length === 0);
    isDirty(true);
  });
}, { name: 'validateForm' });

// 3. UI state synchronization
export const syncUIState = action((uiState: UIState) => {
  console.log('action: syncing UI state');
  
  batch(() => {
    // Update all UI-related state together
    sidebarOpen(uiState.sidebarOpen);
    modalVisible(uiState.modalVisible);
    activeTab(uiState.activeTab);
    theme(uiState.theme);
    language(uiState.language);
  });
}, { name: 'syncUIState' });

// 4. Optimized list operations
export const updateListItems = action((updates: ItemUpdate[]) => {
  console.log('action: updating list items');
  
  batch(() => {
    updates.forEach(update => {
      items(prev => prev.map(item => 
        item.id === update.id ? { ...item, ...update.changes } : item
      ));
    });
    
    // Update derived state after all item updates
    totalCount(items().length);
    selectedCount(items().filter(item => item.selected).length);
  });
}, { name: 'updateListItems' });

// 5. Animation state updates
export const startAnimation = action(() => {
  console.log('action: starting animation');
  
  batch(() => {
    isAnimating(true);
    animationProgress(0);
    animationDuration(1000);
    animationEasing('ease-in-out');
  });
  
  // Animation loop outside of batch
  animate();
}, { name: 'startAnimation' });`}
      />

      <h2>Advanced Batching Patterns</h2>
      <p>More sophisticated patterns for complex batching scenarios.</p>

      <CodeBlock
        language="typescript"
        code={`// 1. Conditional batching based on state
export const smartBatching = action(() => {
  console.log('action: smart batching');
  
  const shouldBatch = items().length > 10; // Batch only for large lists
  
  if (shouldBatch) {
    batch(() => {
      performBulkUpdates();
    });
  } else {
    performBulkUpdates(); // Individual updates for small lists
  }
}, { name: 'smartBatching' });

// 2. Batching with cleanup
export const batchedEffect = effect(() => {
  const data = externalData();
  
  if (data) {
    // Batch updates in effects
    batch(() => {
      processData(data);
      updateCache(data);
      notifySubscribers(data);
    });
  }
  
  return () => {
    // Cleanup can also be batched
    batch(() => {
      clearCache();
      removeSubscribers();
      resetState();
    });
  };
}, { name: 'batchedEffect' });

// 3. Batching with error handling
export const safeBatching = action(async () => {
  console.log('action: safe batching');
  
  try {
    const data = await fetchData();
    
    batch(() => {
      // All updates happen together or not at all
      processData(data);
      updateUI(data);
      clearErrors();
    });
  } catch (error) {
    batch(() => {
      // Batch error state updates
      setError(error.message);
      setLoading(false);
      resetData();
    });
  }
}, { name: 'safeBatching' });

// 4. Batching with performance monitoring
export const monitoredBatching = action(() => {
  console.log('action: monitored batching');
  
  const startTime = performance.now();
  
  batch(() => {
    performComplexUpdates();
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // Longer than one frame
    console.warn(\`Batched update took \${duration.toFixed(2)}ms\`);
  }
}, { name: 'monitoredBatching' });

// 5. Custom batching utility
export const createBatchingUtility = () => {
  let pendingUpdates: (() => void)[] = [];
  let isBatching = false;
  
  const batchedUpdate = (update: () => void) => {
    if (isBatching) {
      pendingUpdates.push(update);
    } else {
      update();
    }
  };
  
  const startBatch = () => {
    isBatching = true;
    pendingUpdates = [];
  };
  
  const endBatch = () => {
    if (pendingUpdates.length > 0) {
      batch(() => {
        pendingUpdates.forEach(update => update());
      });
    }
    isBatching = false;
    pendingUpdates = [];
  };
  
  return { batchedUpdate, startBatch, endBatch };
};

// Usage
const { batchedUpdate, startBatch, endBatch } = createBatchingUtility();

export const customBatchingExample = action(() => {
  console.log('action: custom batching example');
  
  startBatch();
  
  batchedUpdate(() => state1('value1'));
  batchedUpdate(() => state2('value2'));
  batchedUpdate(() => state3('value3'));
  
  endBatch(); // All updates are batched together
}, { name: 'customBatchingExample' });`}
      />

      <h2>Batching with Derived Values</h2>
      <p>
        Understanding how batching affects derived values and computed state.
      </p>

      <CodeBlock
        language="typescript"
        code={`// Derived values and batching
const items = state<Item[]>([], { name: 'items' });
const filter = state('', { name: 'filter' });
const sortBy = state('name', { name: 'sortBy' });

// Derived value that depends on multiple state atoms
const filteredAndSortedItems = derived(() => {
  console.log('derived: recalculating filtered and sorted items');
  
  const allItems = items();
  const filterValue = filter();
  const sortField = sortBy();
  
  let filtered = allItems;
  if (filterValue) {
    filtered = allItems.filter(item => 
      item.name.toLowerCase().includes(filterValue.toLowerCase())
    );
  }
  
  return filtered.sort((a, b) => 
    a[sortField].localeCompare(b[sortField])
  );
}, { name: 'filteredAndSortedItems' });

// Batching updates to multiple dependencies
export const updateFilterAndSort = action((newFilter: string, newSortBy: string) => {
  console.log('action: updating filter and sort');
  
  batch(() => {
    filter(newFilter);
    sortBy(newSortBy);
    // filteredAndSortedItems only recalculates once after both updates
  });
}, { name: 'updateFilterAndSort' });

// Batching with derived value dependencies
export const addItemAndUpdateStats = action((item: Item) => {
  console.log('action: adding item and updating stats');
  
  batch(() => {
    items(prev => [...prev, item]);
    // These derived values will recalculate after the batch
    totalCount(items().length);
    lastAddedItem(item);
    updateTimestamp(new Date());
  });
}, { name: 'addItemAndUpdateStats' });

// Performance monitoring for derived values
const createMonitoredDerived = <T>(
  computation: () => T,
  name: string
) => {
  let calculationCount = 0;
  
  return derived(() => {
    calculationCount++;
    const start = performance.now();
    
    const result = computation();
    
    const duration = performance.now() - start;
    if (duration > 5) { // Log slow calculations
      console.warn(\`Derived "\${name}" calculation #\${calculationCount} took \${duration.toFixed(2)}ms\`);
    }
    
    return result;
  }, { name });
};

// Usage
const expensiveDerived = createMonitoredDerived(
  () => performExpensiveCalculation(),
  'expensiveDerived'
);`}
      />

      <h2>Debugging and Monitoring</h2>
      <p>
        Tools and techniques for understanding batching behavior and
        performance.
      </p>

      <CodeBlock
        language="typescript"
        code={`// 1. Batching debug utility
export const createBatchingDebugger = () => {
  let batchCount = 0;
  let updateCount = 0;
  let isInBatch = false;
  
  const originalBatch = batch;
  
  // Override batch function for debugging
  const debugBatch = (fn: () => void) => {
    batchCount++;
    isInBatch = true;
    updateCount = 0;
    
    console.group(\`Batch #\${batchCount}\`);
    console.log('Starting batch');
    
    const startTime = performance.now();
    
    originalBatch(() => {
      fn();
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(\`Batch completed: \${updateCount} updates in \${duration.toFixed(2)}ms\`);
    console.groupEnd();
    
    isInBatch = false;
  };
  
  // Override state functions to count updates
  const createDebugState = <T>(initialValue: T, name: string) => {
    const stateInstance = state(initialValue, { name });
    const originalSet = stateInstance;
    
    return (value: T | ((prev: T) => T)) => {
      updateCount++;
      console.log(\`Update #\${updateCount} in \${isInBatch ? 'batch' : 'individual'}: \${name}\`);
      return originalSet(value);
    };
  };
  
  return { debugBatch, createDebugState, getStats: () => ({ batchCount, updateCount }) };
};

// 2. Performance monitoring
export const createPerformanceMonitor = () => {
  const metrics = {
    batchCount: 0,
    individualUpdateCount: 0,
    totalBatchTime: 0,
    maxBatchTime: 0,
  };
  
  const monitorBatch = (fn: () => void) => {
    const start = performance.now();
    batch(fn);
    const duration = performance.now() - start;
    
    metrics.batchCount++;
    metrics.totalBatchTime += duration;
    metrics.maxBatchTime = Math.max(metrics.maxBatchTime, duration);
  };
  
  const logMetrics = () => {
    const avgBatchTime = metrics.totalBatchTime / metrics.batchCount;
    console.table({
      'Total Batches': metrics.batchCount,
      'Individual Updates': metrics.individualUpdateCount,
      'Average Batch Time (ms)': avgBatchTime.toFixed(2),
      'Max Batch Time (ms)': metrics.maxBatchTime.toFixed(2),
    });
  };
  
  return { monitorBatch, logMetrics, metrics };
};

// 3. Batching analyzer
export const analyzeBatching = () => {
  const analysis = {
    recommendedBatches: [] as string[],
    performanceIssues: [] as string[],
    suggestions: [] as string[],
  };
  
  // Analyze state update patterns
  const stateUpdatePatterns = analyzeStateUpdates();
  
  stateUpdatePatterns.forEach(pattern => {
    if (pattern.frequency > 10 && pattern.updatesPerSecond > 5) {
      analysis.recommendedBatches.push(
        \`Consider batching updates to \${pattern.stateName} (updated \${pattern.frequency} times)\`
      );
    }
    
    if (pattern.averageUpdateTime > 5) {
      analysis.performanceIssues.push(
        \`Slow updates detected for \${pattern.stateName} (\${pattern.averageUpdateTime}ms average)\`
      );
    }
  });
  
  return analysis;
};

// 4. Real-time batching monitor
export const createRealtimeMonitor = () => {
  const monitor = {
    isMonitoring: false,
    startTime: 0,
    updates: [] as Array<{ state: string; time: number; batched: boolean }>,
  };
  
  const startMonitoring = () => {
    monitor.isMonitoring = true;
    monitor.startTime = performance.now();
    monitor.updates = [];
    
    console.log('🔍 Starting batching monitor');
  };
  
  const stopMonitoring = () => {
    monitor.isMonitoring = false;
    
    const duration = performance.now() - monitor.startTime;
    const batchedUpdates = monitor.updates.filter(u => u.batched).length;
    const individualUpdates = monitor.updates.length - batchedUpdates;
    
    console.log('📊 Batching Monitor Results:');
    console.log(\`Duration: \${duration.toFixed(2)}ms\`);
    console.log(\`Total Updates: \${monitor.updates.length}\`);
    console.log(\`Batched Updates: \${batchedUpdates}\`);
    console.log(\`Individual Updates: \${individualUpdates}\`);
    console.log(\`Batching Efficiency: \${((batchedUpdates / monitor.updates.length) * 100).toFixed(1)}%\`);
  };
  
  return { startMonitoring, stopMonitoring, monitor };
};`}
      />

      <h2>Best Practices</h2>
      <p>Follow these best practices to get the most out of batching.</p>

      <CodeBlock
        language="typescript"
        code={`// ✅ DO: Batch related updates together
const goodBatching = action(() => {
  batch(() => {
    // Related UI updates
    sidebarOpen(true);
    activePanel('settings');
    currentTab('profile');
  });
}, { name: 'goodBatching' });

// ❌ DON'T: Batch unrelated updates
const badBatching = action(() => {
  batch(() => {
    // Unrelated updates - confusing
    userProfile(profile);
    weatherData(weather);
    gameScore(score);
  });
}, { name: 'badBatching' });

// ✅ DO: Use batching for performance-critical operations
const performanceCritical = action(() => {
  const largeDataset = generateLargeDataset();
  
  batch(() => {
    // Batch updates for large datasets
    items(largeDataset);
    totalCount(largeDataset.length);
    lastUpdated(new Date());
  });
}, { name: 'performanceCritical' });

// ❌ DON'T: Over-batch simple operations
const overBatching = action(() => {
  batch(() => {
    // Unnecessary batching for simple updates
    count(count() + 1);
  });
}, { name: 'overBatching' });

// ✅ DO: Batch updates in effects when appropriate
const goodEffectBatching = effect(() => {
  const data = externalData();
  
  if (data) {
    batch(() => {
      // Batch related updates in effects
      processData(data);
      updateCache(data);
      notifySubscribers(data);
    });
  }
}, { name: 'goodEffectBatching' });

// ❌ DON'T: Always batch in effects
const badEffectBatching = effect(() => {
  // Don't batch every effect update
  batch(() => {
    singleStateUpdate(value);
  });
}, { name: 'badEffectBatching' });

// ✅ DO: Use descriptive batch names for debugging
const descriptiveBatching = action(() => {
  console.log('action: updating user profile');
  
  batch(() => {
    // Clear what this batch does
    userProfile(profile);
    userSettings(settings);
    userPreferences(preferences);
  });
}, { name: 'descriptiveBatching' });

// ✅ DO: Handle errors in batches properly
const errorHandlingBatching = action(async () => {
  try {
    const data = await fetchData();
    
    batch(() => {
      // All updates happen together
      processData(data);
      updateUI(data);
      clearErrors();
    });
  } catch (error) {
    batch(() => {
      // Batch error state updates
      setError(error.message);
      setLoading(false);
      resetData();
    });
  }
}, { name: 'errorHandlingBatching' });

// ✅ DO: Monitor batching performance
const monitoredBatching = action(() => {
  const start = performance.now();
  
  batch(() => {
    performUpdates();
  });
  
  const duration = performance.now() - start;
  if (duration > 16) {
    console.warn(\`Slow batch: \${duration.toFixed(2)}ms\`);
  }
}, { name: 'monitoredBatching' });`}
      />

      <h2>Common Anti-Patterns</h2>
      <p>Avoid these common mistakes when working with batching.</p>

      <CodeBlock
        language="typescript"
        code={`// ❌ Anti-pattern: Batching everything
const overBatching = action(() => {
  batch(() => {
    // Batching simple, unrelated updates
    count(count() + 1);
    name('John');
    isVisible(true);
    theme('dark');
    language('en');
  });
}, { name: 'overBatching' });

// ✅ Solution: Only batch related updates
const properBatching = action(() => {
  // Simple updates don't need batching
  count(count() + 1);
  
  // Batch related updates
  batch(() => {
    name('John');
    email('john@example.com');
    avatar('avatar.jpg');
  });
}, { name: 'properBatching' });

// ❌ Anti-pattern: Batching in derived values
const badDerivedBatching = derived(() => {
  batch(() => {
    // Don't batch in derived values!
    state1('value1');
    state2('value2');
  });
  
  return computeValue();
}, { name: 'badDerivedBatching' });

// ✅ Solution: Use actions for state updates
const goodActionBatching = action(() => {
  batch(() => {
    state1('value1');
    state2('value2');
  });
}, { name: 'goodActionBatching' });

// ❌ Anti-pattern: Nested batching without purpose
const unnecessaryNestedBatching = action(() => {
  batch(() => {
    state1('value1');
    
    batch(() => {
      state2('value2');
      
      batch(() => {
        state3('value3');
      });
    });
  });
}, { name: 'unnecessaryNestedBatching' });

// ✅ Solution: Single batch for related updates
const simpleBatching = action(() => {
  batch(() => {
    state1('value1');
    state2('value2');
    state3('value3');
  });
}, { name: 'simpleBatching' });

// ❌ Anti-pattern: Batching async operations incorrectly
const badAsyncBatching = action(async () => {
  batch(() => {
    // Don't batch async operations like this
    const data = await fetchData();
    processData(data);
  });
}, { name: 'badAsyncBatching' });

// ✅ Solution: Batch after async operations
const goodAsyncBatching = action(async () => {
  const data = await fetchData();
  
  batch(() => {
    processData(data);
    updateUI(data);
    clearLoading();
  });
}, { name: 'goodAsyncBatching' });

// ❌ Anti-pattern: Forgetting to handle errors in batches
const badErrorHandling = action(() => {
  batch(() => {
    // If any update fails, the whole batch might fail
    riskyUpdate1();
    riskyUpdate2();
    riskyUpdate3();
  });
}, { name: 'badErrorHandling' });

// ✅ Solution: Handle errors properly
const goodErrorHandling = action(() => {
  try {
    batch(() => {
      safeUpdate1();
      safeUpdate2();
      safeUpdate3();
    });
  } catch (error) {
    // Handle batch errors
    console.error('Batch failed:', error);
    rollbackChanges();
  }
}, { name: 'goodErrorHandling' });`}
      />

      <h2>Next Steps</h2>
      <p>Now that you understand batching, explore these related topics:</p>

      <div className={styles.navigation}>
        <Link to="/guides/testing" className={styles.navLink}>
          Testing Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/batch" className={styles.navLink}>
          batch() API Reference
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/action" className={styles.navLink}>
          action() API Reference
        </Link>
      </div>
    </div>
  );
};

export default Batching;
