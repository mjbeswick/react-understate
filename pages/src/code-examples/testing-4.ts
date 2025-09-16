// Testing effects
describe('Effect Testing', () => {
  test('should execute effect on dependency change', () => {
    const count = state(0, { name: 'count' });
    const effectSpy = jest.fn();
    
    const testEffect = effect(() => {
      effectSpy(count());
    }, { name: 'testEffect' });
    
    // Initial execution
    expect(effectSpy).toHaveBeenCalledWith(0);
    
    // Dependency change
    count(5);
    expect(effectSpy).toHaveBeenCalledWith(5);
    
    count(10);
    expect(effectSpy).toHaveBeenCalledWith(10);
  });

  test('should handle effect cleanup', () => {
    const isActive = state(true, { name: 'isActive' });
    const cleanupSpy = jest.fn();
    
    const testEffect = effect(() => {
      if (isActive()) {
        const interval = setInterval(() => {
          console.log('tick');
        }, 100);
        
        return () => {
          cleanupSpy();
          clearInterval(interval);
        };
      }
    }, { name: 'testEffect' });
    
    // Trigger cleanup
    isActive(false);
    
    // Wait for cleanup
    setTimeout(() => {
      expect(cleanupSpy).toHaveBeenCalled();
    }, 200);
  });

  test('should handle async effects', async () => {
    const userId = state<number | null>(null, { name: 'userId' });
    const userData = state(null, { name: 'userData' });
    
    const userEffect = effect(async () => {
      const id = userId();
      if (id) {
        const data = await mockFetchUser(id);
        userData(data);
      }
    }, { name: 'userEffect' });
    
    // Mock fetch function
    const mockFetchUser = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    
    userId(1);
    
    // Wait for async effect
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(mockFetchUser).toHaveBeenCalledWith(1);
    expect(userData()).toEqual({ id: 1, name: 'John' });
  });

  test('should handle effect errors', () => {
    const shouldError = state(false, { name: 'shouldError' });
    const errorSpy = jest.fn();
    
    const errorEffect = effect(() => {
      if (shouldError()) {
        throw new Error('Effect error');
      }
    }, { name: 'errorEffect' });
    
    // Mock console.error to catch error
    const originalError = console.error;
    console.error = errorSpy;
    
    shouldError(true);
    
    expect(errorSpy).toHaveBeenCalled();
    
    console.error = originalError;
  });
});

// Testing effect dependencies
describe('Effect Dependencies', () => {
  test('should only depend on accessed state', () => {
    const state1 = state(0, { name: 'state1' });
    const state2 = state(0, { name: 'state2' });
    const effectSpy = jest.fn();
    
    const selectiveEffect = effect(() => {
      // Only depends on state1
      effectSpy(state1());
    }, { name: 'selectiveEffect' });
    
    // Initial execution
    expect(effectSpy).toHaveBeenCalledWith(0);
    
    // Change state1 - should trigger
    state1(5);
    expect(effectSpy).toHaveBeenCalledWith(5);
    
    // Change state2 - should not trigger
    state2(10);
    expect(effectSpy).toHaveBeenCalledTimes(2); // Only initial + state1 change
  });
});