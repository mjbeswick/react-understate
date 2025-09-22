import { state, derived, action } from 'react-understate';

// Basic state testing
describe('State Testing', () => {
  test('should initialize with correct value', () => {
    const count = state(0, { name: 'count' });
    expect(count()).toBe(0);
  });

  test('should update value correctly', () => {
    const count = state(0, { name: 'count' });
    
    count(5);
    expect(count()).toBe(5);
    
    count(prev => prev + 1);
    expect(count()).toBe(6);
  });

  test('should handle object state updates', () => {
    const user = state({ name: '', email: '' }, { name: 'user' });
    
    user(prev => ({ ...prev, name: 'John' }));
    expect(user()).toEqual({ name: 'John', email: '' });
    
    user(prev => ({ ...prev, email: 'john@example.com' }));
    expect(user()).toEqual({ name: 'John', email: 'john@example.com' });
  });

  test('should handle array state updates', () => {
    const items = state<string[]>([], { name: 'items' });
    
    items(prev => [...prev, 'item1']);
    expect(items()).toEqual(['item1']);
    
    items(prev => [...prev, 'item2']);
    expect(items()).toEqual(['item1', 'item2']);
    
    items(prev => prev.filter(item => item !== 'item1'));
    expect(items()).toEqual(['item2']);
  });
});

// State with complex logic
describe('Complex State Logic', () => {
  test('should handle conditional updates', () => {
    const isLoggedIn = state(false, { name: 'isLoggedIn' });
    const user = state(null, { name: 'user' });
    
    const login = action((userData: any) => {
      isLoggedIn(true);
      user(userData);
    }, { name: 'login' });
    
    const logout = action(() => {
      isLoggedIn(false);
      user(null);
    }, { name: 'logout' });
    
    // Test login
    login({ id: 1, name: 'John' });
    expect(isLoggedIn()).toBe(true);
    expect(user()).toEqual({ id: 1, name: 'John' });
    
    // Test logout
    logout();
    expect(isLoggedIn()).toBe(false);
    expect(user()).toBe(null);
  });

  test('should handle state validation', () => {
    const email = state('', { name: 'email' });
    const isValidEmail = (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    
    const setEmail = action((newEmail: string) => {
      if (isValidEmail(newEmail)) {
        email(newEmail);
      } else {
        throw new Error('Invalid email format');
      }
    }, { name: 'setEmail' });
    
    // Test valid email
    setEmail('test@example.com');
    expect(email()).toBe('test@example.com');
    
    // Test invalid email
    expect(() => setEmail('invalid-email')).toThrow('Invalid email format');
    expect(email()).toBe('test@example.com'); // Should not change
  });
});