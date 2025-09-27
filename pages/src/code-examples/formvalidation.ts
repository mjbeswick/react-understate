import { state, derived, action } from 'react-understate';

// Form state
const formData = state(
  {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
  },
  { name: 'formData' },
);

const touched = state(
  {
    email: false,
    password: false,
    confirmPassword: false,
    name: false,
    age: false,
  },
  { name: 'touched' },
);

const errors = state(
  {
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
  },
  { name: 'errors' },
);

// Validation rules
const validationRules = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return '';
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  },

  confirmPassword: (value: string) => {
    const password = formData().password;
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return '';
  },

  name: (value: string) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return '';
  },

  age: (value: string) => {
    if (!value) return 'Age is required';
    const age = parseInt(value);
    if (isNaN(age) || age < 18 || age > 120) {
      return 'Age must be between 18 and 120';
    }
    return '';
  },
};

// Derived validation state
export const fieldErrors = derived(
  () => {
    const data = formData();
    const touchedFields = touched();

    const fieldErrors: Record<string, string> = {};

    Object.keys(data).forEach(field => {
      const value = data[field as keyof typeof data];
      const isTouched = touchedFields[field as keyof typeof touchedFields];

      if (isTouched) {
        const rule = validationRules[field as keyof typeof validationRules];
        fieldErrors[field] = rule ? rule(value) : '';
      }
    });

    return fieldErrors;
  },
  { name: 'fieldErrors' },
);

export const isFormValid = derived(
  () => {
    const data = formData();
    const fieldErrorsValue = fieldErrors();

    return Object.keys(data).every(field => {
      const value = data[field as keyof typeof data];
      const error = fieldErrorsValue[field];
      return value && !error;
    });
  },
  { name: 'isFormValid' },
);

export const isFormDirty = derived(
  () => {
    const data = formData();
    return Object.values(data).some(value => value !== '');
  },
  { name: 'isFormDirty' },
);

// Actions
export const setFieldValue = action(
  (field: string, value: string) => {
    console.log('action: setting field value', field, value);
    formData(prev => ({ ...prev, [field]: value }));
  },
  { name: 'setFieldValue' },
);

export const setFieldTouched = action(
  (field: string, isTouched: boolean = true) => {
    console.log('action: setting field touched', field, isTouched);
    touched(prev => ({ ...prev, [field]: isTouched }));
  },
  { name: 'setFieldTouched' },
);

export const validateField = action(
  (field: string) => {
    console.log('action: validating field', field);
    const data = formData();
    const value = data[field as keyof typeof data];
    const rule = validationRules[field as keyof typeof validationRules];

    if (rule) {
      const error = rule(value);
      errors(prev => ({ ...prev, [field]: error }));
    }
  },
  { name: 'validateField' },
);

export const validateForm = action(
  () => {
    console.log('action: validating entire form');
    const data = formData();

    Object.keys(data).forEach(field => {
      validateField(field);
    });
  },
  { name: 'validateForm' },
);

export const resetForm = action(
  () => {
    console.log('action: resetting form');
    formData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: '',
    });
    touched({
      email: false,
      password: false,
      confirmPassword: false,
      name: false,
      age: false,
    });
    errors({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: '',
    });
  },
  { name: 'resetForm' },
);
