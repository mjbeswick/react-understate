import { state, action } from 'react-understate';

const data = state<any[]>([]);
const errors = state<Record<string, string>>({});
const isLoading = state(false);

// Centralized error handling
const handleError = action((operation: string, error: Error) => {
  errors.value = {
    ...errors.value,
    [operation]: error.message,
  };
  console.error(`${operation} failed:`, error);
}, 'handleError');

const clearError = action((operation: string) => {
  const newErrors = { ...errors.value };
  delete newErrors[operation];
  errors.value = newErrors;
}, 'clearError');

// Action with comprehensive error handling
const fetchDataWithRetry = action(async (url: string, maxRetries = 3) => {
  const operation = 'fetchData';
  clearError(operation);
  isLoading.value = true;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      data.value = result;
      clearError(operation); // Clear any previous errors
      return result;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        handleError(operation, error as Error);
        throw error; // Re-throw on final attempt
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}, 'fetchDataWithRetry');

// Action with validation
const validateAndSave = action(async (userData: any) => {
  const operation = 'saveUser';
  clearError(operation);

  try {
    // Validation
    if (!userData.email || !userData.email.includes('@')) {
      throw new Error('Valid email is required');
    }

    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    // Save operation
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Save failed');
    }

    const savedUser = await response.json();
    data.value = [...data.value, savedUser];
  } catch (error) {
    handleError(operation, error as Error);
    throw error; // Let caller handle UI response
  }
}, 'validateAndSave');
