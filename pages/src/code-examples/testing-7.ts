// Testing utilities
export const createTestState = <T>(initialValue: T, name: string) => {
  const stateInstance = state(initialValue, { name });
  const updates: T[] = [initialValue];
  
  const originalSet = stateInstance;
  const wrappedSet = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as Function)(stateInstance()) : value;
    updates.push(newValue);
    return originalSet(value);
  };
  
  return {
    state: stateInstance,
    updates,
    reset: () => {
      updates.length = 1;
      updates[0] = initialValue;
      stateInstance(initialValue);
    },
    getLastUpdate: () => updates[updates.length - 1],
    getUpdateCount: () => updates.length - 1,
  };
};

// Usage
describe('Testing Utilities', () => {
  test('should track state updates', () => {
    const { state, updates, getUpdateCount } = createTestState(0, 'testCount');
    
    expect(getUpdateCount()).toBe(0);
    
    state(5);
    expect(getUpdateCount()).toBe(1);
    expect(updates).toEqual([0, 5]);
    
    state(prev => prev + 1);
    expect(getUpdateCount()).toBe(2);
    expect(updates).toEqual([0, 5, 6]);
  });
});

// Mock utilities
export const createMockState = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<() => void>();
  
  const mockState = (newValue?: T | ((prev: T) => T)) => {
    if (newValue !== undefined) {
      value = typeof newValue === 'function' ? (newValue as Function)(value) : newValue;
      subscribers.forEach(callback => callback());
    }
    return value;
  };
  
  mockState.subscribe = (callback: () => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  };
  
  return mockState;
};

// Test helpers for React components
export const renderWithState = (
  component: React.ReactElement,
  initialState: Record<string, any> = {}
) => {
  // Setup initial state
  Object.entries(initialState).forEach(([key, value]) => {
    // This would need to be implemented based on your state management
    // For example, if you have a global state registry
  });
  
  return render(component);
};

// Async testing utilities
export const waitForState = async (
  stateGetter: () => any,
  expectedValue: any,
  timeout = 1000
) => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (stateGetter() === expectedValue) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  throw new Error(\`State did not reach expected value within \${timeout}ms\`);
};

// Usage
test('should wait for async state update', async () => {
  const data = state(null, { name: 'data' });
  
  // Simulate async update
  setTimeout(() => {
    data({ id: 1, name: 'Test' });
  }, 100);
  
  await waitForState(() => data(), { id: 1, name: 'Test' });
  
  expect(data()).toEqual({ id: 1, name: 'Test' });
});

// Performance testing utilities
export const measurePerformance = async (fn: () => void | Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// Usage
test('should measure performance', async () => {
  const duration = await measurePerformance(async () => {
    // Perform some operation
    await new Promise(resolve => setTimeout(resolve, 100));
  });
  
  expect(duration).toBeGreaterThan(100);
  expect(duration).toBeLessThan(200);
});