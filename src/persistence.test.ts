import { state } from "./core";
import {
  persistStorage,
  persistLocalStorage,
  persistSessionStorage,
  persistStates,
} from "./persistence";

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

describe("persistStorage", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    jest.clearAllMocks();
  });

  it("should load initial value from storage", () => {
    const testData = { name: "John", age: 30 };
    mockStorage.setItem("test-key", JSON.stringify(testData));

    const testState = state({ name: "Default", age: 0 });
    persistStorage(testState, "test-key", mockStorage);

    expect(testState.value).toEqual(testData);
  });

  it("should persist changes to storage", () => {
    const testState = state({ name: "John", age: 30 });
    persistStorage(testState, "test-key", mockStorage);

    testState.value = { name: "Jane", age: 25 };

    expect(mockStorage.getItem("test-key")).toBe(
      JSON.stringify({ name: "Jane", age: 25 }),
    );
  });

  it("should handle custom serializer and deserializer", () => {
    const testState = state({ name: "John", age: 30 });

    const customSerialize = (value: any) => `custom:${JSON.stringify(value)}`;
    const customDeserialize = (value: string) =>
      JSON.parse(value.replace("custom:", ""));

    mockStorage.setItem("test-key", customSerialize({ name: "Jane", age: 25 }));

    persistStorage(testState, "test-key", mockStorage, {
      serialize: customSerialize,
      deserialize: customDeserialize,
    });

    expect(testState.value).toEqual({ name: "Jane", age: 25 });

    testState.value = { name: "Bob", age: 40 };
    expect(mockStorage.getItem("test-key")).toBe(
      'custom:{"name":"Bob","age":40}',
    );
  });

  it("should handle errors gracefully", () => {
    const testState = state({ name: "John", age: 30 });
    const errorHandler = jest.fn();

    // Mock storage to throw error
    const errorStorage = {
      ...mockStorage,
      setItem: jest.fn().mockImplementation(() => {
        throw new Error("Storage error");
      }),
    };

    persistStorage(testState, "test-key", errorStorage, {
      onError: errorHandler,
    });

    testState.value = { name: "Jane", age: 25 };

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should not load initial value when loadInitial is false", () => {
    const testData = { name: "John", age: 30 };
    mockStorage.setItem("test-key", JSON.stringify(testData));

    const testState = state({ name: "Default", age: 0 });
    persistStorage(testState, "test-key", mockStorage, { loadInitial: false });

    expect(testState.value).toEqual({ name: "Default", age: 0 });
  });

  it("should return dispose function", () => {
    const testState = state({ name: "John", age: 30 });
    const dispose = persistStorage(testState, "test-key", mockStorage);

    expect(typeof dispose).toBe("function");
    expect(() => dispose()).not.toThrow();
  });

  // Note: Cross-tab sync tests are complex to mock properly
  // The functionality works in real browsers with actual localStorage/sessionStorage
});

describe("persistLocalStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work with localStorage when available", () => {
    const testState = state({ name: "John", age: 30 });
    const dispose = persistLocalStorage(testState, "test-key");

    expect(typeof dispose).toBe("function");
  });

  it("should handle missing localStorage gracefully", () => {
    const originalWindow = (global as any).window;
    delete (global as any).window;

    const testState = state({ name: "John", age: 30 });
    const dispose = persistLocalStorage(testState, "test-key");

    expect(typeof dispose).toBe("function");
    expect(() => dispose()).not.toThrow();

    (global as any).window = originalWindow;
  });
});

describe("persistSessionStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should work with sessionStorage when available", () => {
    const testState = state({ name: "John", age: 30 });
    const dispose = persistSessionStorage(testState, "test-key");

    expect(typeof dispose).toBe("function");
  });

  it("should handle missing sessionStorage gracefully", () => {
    const originalWindow = (global as any).window;
    delete (global as any).window;

    const testState = state({ name: "John", age: 30 });
    const dispose = persistSessionStorage(testState, "test-key");

    expect(typeof dispose).toBe("function");
    expect(() => dispose()).not.toThrow();

    (global as any).window = originalWindow;
  });
});

describe("persistStates", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    jest.clearAllMocks();
  });

  it("should persist multiple states with key prefix", () => {
    const todos = state([{ id: 1, text: "Test", completed: false }]);
    const filter = state("all");
    const states = { todos, filter };

    const dispose = persistStates(states, "todo-app", mockStorage);

    expect(typeof dispose).toBe("function");

    // Check that both states are persisted
    todos.value = [{ id: 2, text: "New todo", completed: true }];
    filter.value = "active";

    expect(mockStorage.getItem("todo-app.todos")).toBe(
      JSON.stringify([{ id: 2, text: "New todo", completed: true }]),
    );
    expect(mockStorage.getItem("todo-app.filter")).toBe('"active"');
  });

  it("should load initial values for all states", () => {
    mockStorage.setItem(
      "todo-app.todos",
      JSON.stringify([{ id: 1, text: "Loaded", completed: false }]),
    );
    mockStorage.setItem("todo-app.filter", '"completed"');

    const todos = state([]);
    const filter = state("all");
    const states = { todos, filter };

    persistStates(states, "todo-app", mockStorage);

    expect(todos.value).toEqual([{ id: 1, text: "Loaded", completed: false }]);
    expect(filter.value).toBe("completed");
  });

  it("should dispose all effects when dispose is called", () => {
    const todos = state([{ id: 1, text: "Test", completed: false }]);
    const filter = state("all");
    const states = { todos, filter };

    const dispose = persistStates(states, "todo-app", mockStorage);

    // Clear storage to verify effects are disposed
    mockStorage.clear();

    dispose();

    // Changes should no longer be persisted
    todos.value = [{ id: 2, text: "New todo", completed: true }];
    filter.value = "active";

    expect(mockStorage.getItem("todo-app.todos")).toBeNull();
    expect(mockStorage.getItem("todo-app.filter")).toBeNull();
  });

  it("should use sessionStorage as default", () => {
    const todos = state([{ id: 1, text: "Test", completed: false }]);
    const states = { todos };

    const dispose = persistStates(states, "todo-app");

    expect(typeof dispose).toBe("function");
    expect(() => dispose()).not.toThrow();
  });
});

describe("Edge cases and error handling", () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    jest.clearAllMocks();
  });

  it("should handle circular references in serialization", () => {
    const circularObj: any = { name: "John" };
    circularObj.self = circularObj;

    const testState = state(circularObj);
    const errorHandler = jest.fn();

    persistStorage(testState, "test-key", mockStorage, {
      onError: errorHandler,
    });

    // This should trigger an error
    testState.value = circularObj;

    expect(errorHandler).toHaveBeenCalled();
  });

  it("should handle invalid JSON in storage", () => {
    mockStorage.setItem("test-key", "invalid json");

    const testState = state({ name: "Default" });
    const errorHandler = jest.fn();

    persistStorage(testState, "test-key", mockStorage, {
      onError: errorHandler,
    });

    expect(errorHandler).toHaveBeenCalled();
    expect(testState.value).toEqual({ name: "Default" });
  });

  it("should handle storage quota exceeded", () => {
    const testState = state({ name: "John" });
    const errorHandler = jest.fn();

    // Mock storage to throw quota exceeded error
    const quotaStorage = {
      ...mockStorage,
      setItem: jest.fn().mockImplementation(() => {
        const error = new Error("QuotaExceededError");
        (error as any).name = "QuotaExceededError";
        throw error;
      }),
    };

    persistStorage(testState, "test-key", quotaStorage, {
      onError: errorHandler,
    });

    testState.value = { name: "Jane" };

    expect(errorHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "QuotaExceededError",
      }),
    );
  });

  it("should handle primitive values", () => {
    const stringState = state("hello");
    const numberState = state(42);
    const booleanState = state(true);

    persistStorage(stringState, "string-key", mockStorage);
    persistStorage(numberState, "number-key", mockStorage);
    persistStorage(booleanState, "boolean-key", mockStorage);

    expect(mockStorage.getItem("string-key")).toBe('"hello"');
    expect(mockStorage.getItem("number-key")).toBe("42");
    expect(mockStorage.getItem("boolean-key")).toBe("true");
  });

  it("should handle arrays", () => {
    const arrayState = state([1, 2, 3, { nested: "value" }]);
    persistStorage(arrayState, "array-key", mockStorage);

    expect(mockStorage.getItem("array-key")).toBe(
      JSON.stringify([1, 2, 3, { nested: "value" }]),
    );

    // Load from storage
    const newArrayState = state([]);
    persistStorage(newArrayState, "array-key", mockStorage);

    expect(newArrayState.value).toEqual([1, 2, 3, { nested: "value" }]);
  });
});
