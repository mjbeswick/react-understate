import { state, derived, action } from 'react-understate';

function createFormState<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const values = state(initialValues);
  const errors = state({} as Partial<Record<keyof T, string>>);
  const touched = state({} as Partial<Record<keyof T, boolean>>);
  const isSubmitting = state(false);
  
  // Derived values
  const isValid = derived(() => {
    return Object.values(errors.value).every(error => !error);
  });
  
  const isDirty = derived(() => {
    return JSON.stringify(values.value) !== JSON.stringify(initialValues);
  });
  
  // Actions
  const setValue = action((field: keyof T, value: any) => {
    values.value = { ...values.value, [field]: value };
    
    // Clear error when user starts typing
    if (errors.value[field]) {
      errors.value = { ...errors.value, [field]: undefined };
    }
  }, 'setValue');
  
  const setTouched = action((field: keyof T) => {
    touched.value = { ...touched.value, [field]: true };
  }, 'setTouched');
  
  const validate = action(() => {
    if (!validationRules) return true;
    
    const newErrors = {} as Partial<Record<keyof T, string>>;
    
    for (const [field, rule] of Object.entries(validationRules)) {
      const value = values.value[field as keyof T];
      const error = rule(value);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    }
    
    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  }, 'validate');
  
  const reset = action(() => {
    values.value = initialValues;
    errors.value = {};
    touched.value = {};
    isSubmitting.value = false;
  }, 'reset');
  
  const submit = action(async (onSubmit: (values: T) => Promise<void>) => {
    if (!validate()) return false;
    
    isSubmitting.value = true;
    
    try {
      await onSubmit(values.value);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }, 'submit');
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setTouched,
    validate,
    reset,
    submit,
  };
}

// Usage
const userForm = createFormState(
  { name: '', email: '', age: 0 },
  {
    name: (value) => value.length < 2 ? 'Name must be at least 2 characters' : null,
    email: (value) => !value.includes('@') ? 'Invalid email' : null,
    age: (value) => value < 18 ? 'Must be 18 or older' : null,
  }
);