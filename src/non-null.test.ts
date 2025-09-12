import { state } from './core';
import { effect } from './state';

describe('State requiredValue property', () => {
  it('should return the value when it is not null or undefined', () => {
    const count = state(42);
    expect(count.requiredValue).toBe(42);
  });

  it('should return the value when it is 0', () => {
    const count = state(0);
    expect(count.requiredValue).toBe(0);
  });

  it('should return the value when it is false', () => {
    const flag = state(false);
    expect(flag.requiredValue).toBe(false);
  });

  it('should return the value when it is empty string', () => {
    const name = state('');
    expect(name.requiredValue).toBe('');
  });

  it('should throw error when value is null', () => {
    const user = state<User | null>(null);
    expect(() => user.requiredValue).toThrow(
      'Required value is null. Use .value to access the actual value or ensure the state is initialized.',
    );
  });

  it('should throw error when value is undefined', () => {
    const data = state<Data | undefined>(undefined);
    expect(() => data.requiredValue).toThrow(
      'Required value is undefined. Use .value to access the actual value or ensure the state is initialized.',
    );
  });

  it('should track dependencies like .value', () => {
    const count = state(0);
    let effectRuns = 0;

    const dispose = effect(() => {
      effectRuns++;
      const _ = count.requiredValue; // Should track dependency
    }, 'testEffect');

    expect(effectRuns).toBe(1);

    count.value = 1;
    expect(effectRuns).toBe(2);

    dispose();
  });

  it('should work with TypeScript non-null assertion', () => {
    const user = state<User | null>(null);

    // This should compile without TypeScript errors
    // but will throw at runtime if user is null
    expect(() => {
      const name: string = user.requiredValue.name; // TypeScript knows this is string
    }).toThrow();
  });

  it('should work after setting a non-null value', () => {
    const user = state<User | null>(null);

    // Initially throws
    expect(() => user.requiredValue).toThrow();

    // After setting a value, should work
    user.value = { id: 1, name: 'John' };
    expect(user.requiredValue.name).toBe('John');
    expect(user.requiredValue.id).toBe(1);
  });

  it('should work with complex objects', () => {
    const data = state<ComplexData | null>(null);

    data.value = {
      user: { id: 1, name: 'John' },
      settings: { theme: 'dark' },
      items: [1, 2, 3],
    };

    expect(data.requiredValue.user.name).toBe('John');
    expect(data.requiredValue.settings.theme).toBe('dark');
    expect(data.requiredValue.items).toEqual([1, 2, 3]);
  });

  it('should allow setting non-null values', () => {
    const user = state<User | null>(null);
    
    // Should work
    user.requiredValue = { id: 1, name: 'John' };
    expect(user.requiredValue.name).toBe('John');
  });

  it('should throw when setting null values', () => {
    const user = state<User | null>(null);
    
    expect(() => {
      user.requiredValue = null as any;
    }).toThrow('Cannot set required value to null. Use .value to set null/undefined values.');
  });

  it('should throw when setting undefined values', () => {
    const user = state<User | null>(null);
    
    expect(() => {
      user.requiredValue = undefined as any;
    }).toThrow('Cannot set required value to undefined. Use .value to set null/undefined values.');
  });
});

// Test types
type User = {
  id: number;
  name: string;
};

type Data = {
  value: string;
};

type ComplexData = {
  user: User;
  settings: { theme: string };
  items: number[];
};
