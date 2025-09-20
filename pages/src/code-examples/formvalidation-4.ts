// Validation utility functions
export const validators = {
  required: (value: string) => value ? '' : 'This field is required',
  
  minLength: (min: number) => (value: string) =>
    value.length >= min ? '' : `Must be at least ${min} characters`,
  
  maxLength: (max: number) => (value: string) =>
    value.length <= max ? '' : `Must be no more than ${max} characters`,
  
  email: (value: string) => {
    if (!value) return '';
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(value) ? '' : 'Invalid email format';
  },
  
  phone: (value: string) => {
    if (!value) return '';
    const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
    return phoneRegex.test(value.replace(/[\\s-()]/g, '')) ? '' : 'Invalid phone number';
  },
  
  url: (value: string) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return 'Invalid URL format';
    }
  },
  
  numeric: (value: string) => {
    if (!value) return '';
    return !isNaN(Number(value)) ? '' : 'Must be a number';
  },
  
  range: (min: number, max: number) => (value: string) => {
    if (!value) return '';
    const num = Number(value);
    return num >= min && num <= max ? '' : `Must be between ${min} and ${max}`,
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) =>
    regex.test(value) ? '' : message,
  
  custom: (fn: (value: string) => string | Promise<string>) => fn,
};

// Form validation factory
export const createFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, (value: any) => string | Promise<string>>
) => {
  const values = state(initialValues, { name: 'formValues' });
  const touched = state(
    Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>),
    { name: 'formTouched' }
  );
  const errors = state(
    Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: '' }), {} as Record<keyof T, string>),
    { name: 'formErrors' }
  );
  
  const fieldErrors = derived(() => {
    const currentValues = values();
    const touchedFields = touched();
    const errors: Record<keyof T, string> = {} as any;
    
    Object.keys(currentValues).forEach(field => {
      const value = currentValues[field];
      const isTouched = touchedFields[field];
      
      if (isTouched) {
        const validator = validationSchema[field];
        if (validator) {
          const result = validator(value);
          if (typeof result === 'string') {
            errors[field] = result;
          }
        }
      }
    });
    
    return errors;
  }, { name: 'fieldErrors' });
  
  const isValid = derived(() => {
    const fieldErrorsValue = fieldErrors();
    return Object.values(fieldErrorsValue).every(error => !error);
  }, { name: 'isValid' });
  
  const setFieldValue = action((field: keyof T, value: any) => {
    values(prev => ({ ...prev, [field]: value }));
  }, { name: 'setFieldValue' });
  
  const setFieldTouched = action((field: keyof T, isTouched: boolean = true) => {
    touched(prev => ({ ...prev, [field]: isTouched }));
  }, { name: 'setFieldTouched' });
  
  const validateField = action(async (field: keyof T) => {
    const value = values()[field];
    const validator = validationSchema[field];
    
    if (validator) {
      const result = await validator(value);
      errors(prev => ({ ...prev, [field]: result }));
    }
  }, { name: 'validateField' });
  
  const reset = action(() => {
    values(initialValues);
    touched(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: false }), {} as Record<keyof T, boolean>));
    errors(Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: '' }), {} as Record<keyof T, string>));
  }, { name: 'reset' });
  
  return {
    values,
    touched,
    errors,
    fieldErrors,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateField,
    reset,
  };
};

// Usage example
const userForm = createFormValidation(
  {
    name: '',
    email: '',
    age: '',
  },
  {
    name: validators.required,
    email: validators.email,
    age: validators.custom((value) => {
      const age = parseInt(value);
      if (isNaN(age)) return 'Must be a number';
      if (age < 18) return 'Must be 18 or older';
      if (age > 120) return 'Must be 120 or younger';
      return '';
    }),
  }
);