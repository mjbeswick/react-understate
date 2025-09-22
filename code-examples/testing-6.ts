// Integration testing
describe('Integration Tests', () => {
  test('should handle complete user flow', async () => {
    // Setup
    const user = state(null, { name: 'user' });
    const isLoggedIn = state(false, { name: 'isLoggedIn' });
    const todos = state<Todo[]>([], { name: 'todos' });
    
    const login = action(async (credentials: any) => {
      const userData = await mockLogin(credentials);
      user(userData);
      isLoggedIn(true);
    }, { name: 'login' });
    
    const addTodo = action((text: string) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
      };
      todos(prev => [...prev, newTodo]);
    }, { name: 'addTodo' });
    
    const toggleTodo = action((id: string) => {
      todos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    }, { name: 'toggleTodo' });
    
    // Mock API
    const mockLogin = jest.fn().mockResolvedValue({ id: 1, name: 'John' });
    
    // Test complete flow
    await login({ email: 'john@example.com', password: 'password' });
    
    expect(isLoggedIn()).toBe(true);
    expect(user()).toEqual({ id: 1, name: 'John' });
    
    addTodo('Learn React Understate');
    addTodo('Write tests');
    
    expect(todos()).toHaveLength(2);
    expect(todos()[0].text).toBe('Learn React Understate');
    
    toggleTodo(todos()[0].id);
    
    expect(todos()[0].completed).toBe(true);
    expect(todos()[1].completed).toBe(false);
  });

  test('should handle state persistence', () => {
    // Setup persistence
    const settings = state({
      theme: 'light',
      language: 'en',
    }, { name: 'settings' });
    
    const saveSettings = action((newSettings: any) => {
      settings(newSettings);
      localStorage.setItem('settings', JSON.stringify(newSettings));
    }, { name: 'saveSettings' });
    
    const loadSettings = action(() => {
      const saved = localStorage.getItem('settings');
      if (saved) {
        settings(JSON.parse(saved));
      }
    }, { name: 'loadSettings' });
    
    // Test save
    saveSettings({ theme: 'dark', language: 'es' });
    
    expect(settings()).toEqual({ theme: 'dark', language: 'es' });
    expect(localStorage.getItem('settings')).toBe(
      JSON.stringify({ theme: 'dark', language: 'es' })
    );
    
    // Test load
    settings({ theme: 'light', language: 'en' }); // Reset
    loadSettings();
    
    expect(settings()).toEqual({ theme: 'dark', language: 'es' });
  });
});

// Testing error boundaries
describe('Error Boundary Testing', () => {
  test('should handle state errors gracefully', () => {
    const errorState = state(null, { name: 'errorState' });
    
    const riskyAction = action(() => {
      throw new Error('State error');
    }, { name: 'riskyAction' });
    
    // Mock error boundary
    const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
      const [hasError, setHasError] = React.useState(false);
      
      React.useEffect(() => {
        const handleError = () => setHasError(true);
        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
      }, []);
      
      if (hasError) {
        return <div>Error occurred</div>;
      }
      
      return <>{children}</>;
    };
    
    const TestComponent = () => {
      const count = useUnderstate(counterState);
      
      return (
        <div>
          <span>{count}</span>
          <button onClick={riskyAction}>Risky Action</button>
        </div>
      );
    };
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    // Trigger error
    fireEvent.click(screen.getByText('Risky Action'));
    
    // Error should be caught by boundary
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });
});