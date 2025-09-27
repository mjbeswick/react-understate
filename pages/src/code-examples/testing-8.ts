// ✅ DO: Test behavior, not implementation
const goodTest = () => {
  const count = state(0, { name: 'count' });
  const increment = action(() => count(prev => prev + 1), {
    name: 'increment',
  });

  increment();
  expect(count()).toBe(1); // Test the behavior, not the implementation
};

// ❌ DON'T: Test implementation details
const badTest = () => {
  const count = state(0, { name: 'count' });
  const increment = action(() => count(prev => prev + 1), {
    name: 'increment',
  });

  // Don't test internal implementation
  expect(increment.toString()).toContain('prev => prev + 1');
};

// ✅ DO: Use descriptive test names
describe('User Authentication', () => {
  test('should login user with valid credentials', () => {
    // Test implementation
  });

  test('should reject login with invalid credentials', () => {
    // Test implementation
  });

  test('should logout user and clear session', () => {
    // Test implementation
  });
});

// ❌ DON'T: Use vague test names
describe('Auth', () => {
  test('should work', () => {
    // What exactly should work?
  });
});

// ✅ DO: Test edge cases
describe('Edge Cases', () => {
  test('should handle empty arrays', () => {
    const items = state<string[]>([], { name: 'items' });
    const filtered = derived(() => items().filter(item => item.length > 0), {
      name: 'filtered',
    });

    expect(filtered()).toEqual([]);
  });

  test('should handle null values', () => {
    const data = state(null, { name: 'data' });
    const processed = derived(() => data()?.name || 'default', {
      name: 'processed',
    });

    expect(processed()).toBe('default');
  });
});

// ✅ DO: Use setup and teardown
describe('State Management', () => {
  let testState: any;

  beforeEach(() => {
    // Setup before each test
    testState = state(0, { name: 'testState' });
  });

  afterEach(() => {
    // Cleanup after each test
    testState(0);
  });

  test('should increment state', () => {
    testState(prev => prev + 1);
    expect(testState()).toBe(1);
  });
});

// ✅ DO: Test error conditions
describe('Error Handling', () => {
  test('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const fetchData = action(
      async () => {
        const data = await mockFetch('/api/data');
        return data;
      },
      { name: 'fetchData' },
    );

    await expect(fetchData()).rejects.toThrow('Network error');
  });
});

// ✅ DO: Use mocks appropriately
describe('API Integration', () => {
  test('should save data to API', async () => {
    const mockSave = jest.fn().mockResolvedValue({ id: 1 });

    const saveData = action(
      async (data: any) => {
        return await mockSave('/api/save', data);
      },
      { name: 'saveData' },
    );

    const result = await saveData({ name: 'Test' });

    expect(mockSave).toHaveBeenCalledWith('/api/save', { name: 'Test' });
    expect(result).toEqual({ id: 1 });
  });
});

// ✅ DO: Test cleanup
describe('Cleanup', () => {
  test('should cleanup effects on unmount', () => {
    const cleanupSpy = jest.fn();

    const testEffect = effect(
      () => {
        return () => cleanupSpy();
      },
      { name: 'testEffect' },
    );

    // Simulate unmount
    // In a real test, you'd unmount the component

    expect(cleanupSpy).toHaveBeenCalled();
  });
});
