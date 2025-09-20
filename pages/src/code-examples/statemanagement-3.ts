// 1. Loading states pattern
export const createAsyncState = <T>(initialData: T) => {
  const data = state(initialData, { name: 'data' });
  const loading = state(false, { name: 'loading' });
  const error = state<string | null>(null, { name: 'error' });
  
  const isIdle = derived(() => !loading() && !error(), { name: 'isIdle' });
  const hasError = derived(() => error() !== null, { name: 'hasError' });
  
  return { data, loading, error, isIdle, hasError };
};

// 2. Form state pattern
export const createFormState = <T extends Record<string, any>>(initialValues: T) => {
  const values = state(initialValues, { name: 'formValues' });
  const errors = state<Partial<Record<keyof T, string>>>({}, { name: 'formErrors' });
  const touched = state<Partial<Record<keyof T, boolean>>>({}, { name: 'formTouched' });
  const isSubmitting = state(false, { name: 'isSubmitting' });
  
  const isValid = derived(() => Object.keys(errors()).length === 0, { name: 'isValid' });
  const isDirty = derived(() => {
    const current = values();
    return Object.keys(current).some(key => current[key] !== initialValues[key]);
  }, { name: 'isDirty' });
  
  const setValue = action((field: keyof T, value: any) => {
    values(prev => ({ ...prev, [field]: value }));
    touched(prev => ({ ...prev, [field]: true }));
  }, { name: 'setValue' });
  
  const setError = action((field: keyof T, error: string) => {
    errors(prev => ({ ...prev, [field]: error }));
  }, { name: 'setError' });
  
  const clearError = action((field: keyof T) => {
    errors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, { name: 'clearError' });
  
  const reset = action(() => {
    values(initialValues);
    errors({});
    touched({});
    isSubmitting(false);
  }, { name: 'reset' });
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setError,
    clearError,
    reset,
  };
};

// 3. Modal/Dialog state pattern
export const createModalState = () => {
  const isOpen = state(false, { name: 'modalOpen' });
  const data = state<any>(null, { name: 'modalData' });
  
  const open = action((modalData?: any) => {
    console.log('action: opening modal');
    isOpen(true);
    if (modalData !== undefined) {
      data(modalData);
    }
  }, { name: 'openModal' });
  
  const close = action(() => {
    console.log('action: closing modal');
    isOpen(false);
    data(null);
  }, { name: 'closeModal' });
  
  const toggle = action(() => {
    console.log('action: toggling modal');
    isOpen(prev => !prev);
  }, { name: 'toggleModal' });
  
  return { isOpen, data, open, close, toggle };
};

// Usage examples
export const userAsyncState = createAsyncState({ id: null, name: '', email: '' });
export const loginForm = createFormState({ email: '', password: '' });
export const confirmModal = createModalState();