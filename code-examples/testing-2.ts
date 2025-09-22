// Testing derived values
describe('Derived Values Testing', () => {
  test('should compute derived value correctly', () => {
    const firstName = state('John', { name: 'firstName' });
    const lastName = state('Doe', { name: 'lastName' });
    
    const fullName = derived(() => `${firstName()} ${lastName()}`, {
      name: 'fullName',
    });
    
    expect(fullName()).toBe('John Doe');
  });

  test('should update when dependencies change', () => {
    const count = state(0, { name: 'count' });
    const multiplier = state(2, { name: 'multiplier' });
    
    const doubled = derived(() => count() * multiplier(), {
      name: 'doubled',
    });
    
    expect(doubled()).toBe(0);
    
    count(5);
    expect(doubled()).toBe(10);
    
    multiplier(3);
    expect(doubled()).toBe(15);
  });

  test('should handle complex derived logic', () => {
    const todos = state<Todo[]>([], { name: 'todos' });
    const filter = state('all', { name: 'filter' });
    
    const filteredTodos = derived(() => {
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
    
    // Test with different filters
    todos([
      { id: '1', text: 'Todo 1', completed: false },
      { id: '2', text: 'Todo 2', completed: true },
    ]);
    
    expect(filteredTodos()).toHaveLength(2);
    
    filter('active');
    expect(filteredTodos()).toHaveLength(1);
    expect(filteredTodos()[0].text).toBe('Todo 1');
    
    filter('completed');
    expect(filteredTodos()).toHaveLength(1);
    expect(filteredTodos()[0].text).toBe('Todo 2');
  });

  test('should handle async derived values', async () => {
    const userId = state<number | null>(null, { name: 'userId' });
    
    const userData = derived(async () => {
      const id = userId();
      if (!id) return null;
      
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10));
      return { id, name: `User ${id}` };
    }, { name: 'userData' });
    
    userId(1);
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const data = await userData();
    expect(data).toEqual({ id: 1, name: 'User 1' });
  });
});

// Testing derived value performance
describe('Derived Value Performance', () => {
  test('should not recalculate unnecessarily', () => {
    let calculationCount = 0;
    
    const base = state(0, { name: 'base' });
    const expensive = derived(() => {
      calculationCount++;
      return base() * 2;
    }, { name: 'expensive' });
    
    // Initial calculation
    expect(expensive()).toBe(0);
    expect(calculationCount).toBe(1);
    
    // Accessing without dependency change
    expect(expensive()).toBe(0);
    expect(calculationCount).toBe(1); // Should not recalculate
    
    // Dependency change
    base(5);
    expect(expensive()).toBe(10);
    expect(calculationCount).toBe(2); // Should recalculate
  });
});