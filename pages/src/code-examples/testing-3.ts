// Testing actions
describe('Action Testing', () => {
  test('should update state correctly', () => {
    const count = state(0, { name: 'count' });

    const increment = action(
      () => {
        count(prev => prev + 1);
      },
      { name: 'increment' },
    );

    increment();
    expect(count()).toBe(1);

    increment();
    expect(count()).toBe(2);
  });

  test('should handle async actions', async () => {
    const data = state(null, { name: 'data' });
    const loading = state(false, { name: 'loading' });
    const error = state(null, { name: 'error' });

    const fetchData = action(
      async () => {
        loading(true);
        error(null);

        try {
          const result = await mockFetch('/api/data');
          data(result);
        } catch (err) {
          error(err.message);
        } finally {
          loading(false);
        }
      },
      { name: 'fetchData' },
    );

    // Mock fetch function
    const mockFetch = jest.fn().mockResolvedValue({ id: 1, name: 'Test' });

    await fetchData();

    expect(loading()).toBe(false);
    expect(data()).toEqual({ id: 1, name: 'Test' });
    expect(error()).toBe(null);
  });

  test('should handle action errors', async () => {
    const error = state(null, { name: 'error' });

    const riskyAction = action(
      async () => {
        throw new Error('Something went wrong');
      },
      { name: 'riskyAction' },
    );

    await expect(riskyAction()).rejects.toThrow('Something went wrong');
  });

  test('should handle action composition', () => {
    const user = state(null, { name: 'user' });
    const isLoggedIn = state(false, { name: 'isLoggedIn' });

    const setUser = action(
      (userData: any) => {
        user(userData);
      },
      { name: 'setUser' },
    );

    const login = action(
      (userData: any) => {
        setUser(userData);
        isLoggedIn(true);
      },
      { name: 'login' },
    );

    login({ id: 1, name: 'John' });

    expect(user()).toEqual({ id: 1, name: 'John' });
    expect(isLoggedIn()).toBe(true);
  });
});

// Testing action side effects
describe('Action Side Effects', () => {
  test('should call external functions', () => {
    const mockCallback = jest.fn();
    const count = state(0, { name: 'count' });

    const incrementWithCallback = action(
      () => {
        count(prev => prev + 1);
        mockCallback(count());
      },
      { name: 'incrementWithCallback' },
    );

    incrementWithCallback();

    expect(mockCallback).toHaveBeenCalledWith(1);
    expect(count()).toBe(1);
  });

  test('should handle API calls', async () => {
    const mockApi = {
      save: jest.fn().mockResolvedValue({ id: 1 }),
      load: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
    };

    const data = state(null, { name: 'data' });

    const saveData = action(
      async (dataToSave: any) => {
        const result = await mockApi.save(dataToSave);
        data(result);
      },
      { name: 'saveData' },
    );

    await saveData({ name: 'Test' });

    expect(mockApi.save).toHaveBeenCalledWith({ name: 'Test' });
    expect(data()).toEqual({ id: 1 });
  });
});
