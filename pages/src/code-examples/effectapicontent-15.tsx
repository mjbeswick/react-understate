import { state, effect } from 'react-understate';

// Mock localStorage for testing
const mockLocalStorage = {
  data: {} as Record<string, string>,
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value;
  }),
  getItem: jest.fn((key: string) => mockLocalStorage.data[key] || null),
  clear: jest.fn(() => {
    mockLocalStorage.data = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Preferences Effect', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should save preferences to localStorage', () => {
    const preferences = state({ theme: 'light' });

    // Create the effect
    effect(() => {
      localStorage.setItem('prefs', JSON.stringify(preferences.value));
    });

    // Verify initial save
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'prefs',
      JSON.stringify({ theme: 'light' }),
    );

    // Update preferences
    preferences.value = { theme: 'dark' };

    // Verify update was saved
    expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
      'prefs',
      JSON.stringify({ theme: 'dark' }),
    );
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const preferences = state({ theme: 'light' });

    effect(() => {
      try {
        localStorage.setItem('prefs', JSON.stringify(preferences.value));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to save preferences:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
