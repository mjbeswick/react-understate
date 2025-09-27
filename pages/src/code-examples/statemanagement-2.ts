import { configureDebug } from 'react-understate';

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  configureDebug({
    enabled: true,
    logStateChanges: true,
    logActionCalls: true,
    logDerivedUpdates: true,
    filter: name => {
      // Only log specific states/actions
      return name.includes('user') || name.includes('todo');
    },
  });
}

// Custom debug logging for specific states
export const debuggedUser = state(
  { name: '', email: '' },
  {
    name: 'debuggedUser',
    debug: {
      logChanges: true,
      beforeChange: (oldValue, newValue) => {
        console.log('User changing from:', oldValue, 'to:', newValue);
      },
      afterChange: newValue => {
        console.log('User changed to:', newValue);
      },
    },
  },
);

// Debug utilities
export const stateSnapshot = () => {
  return {
    user: user(),
    todos: todos(),
    ui: uiSettings(),
    timestamp: new Date().toISOString(),
  };
};

export const logStateSnapshot = action(
  () => {
    console.log('action: logging state snapshot');
    console.table(stateSnapshot());
  },
  { name: 'logStateSnapshot' },
);

// Performance monitoring
export const performanceMonitor = effect(
  () => {
    const startTime = performance.now();

    // Track expensive derived value
    const result = expensiveComputation();

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      // Longer than one frame
      console.warn(`Expensive computation took ${duration.toFixed(2)}ms`);
    }

    return result;
  },
  { name: 'performanceMonitor' },
);
