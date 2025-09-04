import { state } from './core';
import {
  persistLocalStorage,
  persistSessionStorage,
  persistStates,
} from './persistence';

// Mock storage for testing
class MockStorage implements Storage {
  private data: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string): void {
    this.data[key] = value;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  get length(): number {
    return Object.keys(this.data).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }
}

// Mock localStorage and sessionStorage
const mockLocalStorage = new MockStorage();
const mockSessionStorage = new MockStorage();

// Mock window for testing
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  localStorage: mockLocalStorage,
  sessionStorage: mockSessionStorage,
};

// Mock console.warn to avoid test output noise
const originalConsoleWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
  (global as any).window = mockWindow;
  (global as any).localStorage = mockLocalStorage;
  (global as any).sessionStorage = mockSessionStorage;
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  delete (global as any).window;
  delete (global as any).localStorage;
  delete (global as any).sessionStorage;
});

describe('persistLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work with localStorage when available', () => {
    const testState = state({ name: 'John', age: 30 });
    const dispose = persistLocalStorage(testState, 'test-key');

    expect(typeof dispose).toBe('function');
  });

  it('should handle missing localStorage gracefully', () => {
    const originalWindow = (global as any).window;
    delete (global as any).window;

    const testState = state({ name: 'John', age: 30 });
    const dispose = persistLocalStorage(testState, 'test-key');

    expect(typeof dispose).toBe('function');
    expect(() => dispose()).not.toThrow();

    (global as any).window = originalWindow;
  });
});

describe('persistSessionStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work with sessionStorage when available', () => {
    const testState = state({ name: 'John', age: 30 });
    const dispose = persistSessionStorage(testState, 'test-key');

    expect(typeof dispose).toBe('function');
  });

  it('should handle missing sessionStorage gracefully', () => {
    const originalWindow = (global as any).window;
    delete (global as any).window;

    const testState = state({ name: 'John', age: 30 });
    const dispose = persistSessionStorage(testState, 'test-key');

    expect(typeof dispose).toBe('function');
    expect(() => dispose()).not.toThrow();

    (global as any).window = originalWindow;
  });
});

describe('persistStates', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    jest.clearAllMocks();
  });

  it('should persist multiple states with key prefix', () => {
    const todos = state([{ id: 1, text: 'Test', completed: false }]);
    const filter = state('all');
    const states = { todos, filter };

    const dispose = persistStates(states, 'todo-app', mockStorage);

    expect(typeof dispose).toBe('function');

    // Check that both states are persisted
    todos.value = [{ id: 2, text: 'New todo', completed: true }];
    filter.value = 'active';

    expect(mockStorage.getItem('todo-app.todos')).toBe(
      JSON.stringify([{ id: 2, text: 'New todo', completed: true }]),
    );
    expect(mockStorage.getItem('todo-app.filter')).toBe('"active"');
  });

  it('should load initial values for all states', () => {
    mockStorage.setItem(
      'todo-app.todos',
      JSON.stringify([{ id: 1, text: 'Loaded', completed: false }]),
    );
    mockStorage.setItem('todo-app.filter', '"completed"');

    const todos = state([]);
    const filter = state('all');
    const states = { todos, filter };

    persistStates(states, 'todo-app', mockStorage);

    expect(todos.value).toEqual([{ id: 1, text: 'Loaded', completed: false }]);
    expect(filter.value).toBe('completed');
  });

  it('should dispose all effects when dispose is called', () => {
    const todos = state([{ id: 1, text: 'Test', completed: false }]);
    const filter = state('all');
    const states = { todos, filter };

    const dispose = persistStates(states, 'todo-app', mockStorage);

    // Clear storage to verify effects are disposed
    mockStorage.clear();

    dispose();

    // Changes should no longer be persisted
    todos.value = [{ id: 2, text: 'New todo', completed: true }];
    filter.value = 'active';

    expect(mockStorage.getItem('todo-app.todos')).toBeNull();
    expect(mockStorage.getItem('todo-app.filter')).toBeNull();
  });

  it('should use sessionStorage as default', () => {
    const todos = state([{ id: 1, text: 'Test', completed: false }]);
    const states = { todos };

    const dispose = persistStates(states, 'todo-app');

    expect(typeof dispose).toBe('function');
    expect(() => dispose()).not.toThrow();
  });
});
