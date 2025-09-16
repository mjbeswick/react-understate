import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const FormValidation: React.FC = () => {
  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <h1>Form Validation</h1>
        <p className={styles.subtitle}>
          Build robust form validation with real-time feedback and error handling
        </p>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Pattern:</span>
          <Link to="/patterns" className={styles.navLink}>
            Patterns
          </Link>
          <span className={styles.navLabel}>/</span>
          <span>Form Validation</span>
        </div>
      </nav>

      <h2>Overview</h2>
      <p>
        Form validation is a critical part of user experience. React Understate
        provides powerful patterns for building real-time validation with
        excellent performance and user feedback.
      </p>

      <div
        className="pattern-benefits"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Key Features</h3>
        <ul style={{ margin: 0 }}>
          <li>Real-time validation feedback</li>
          <li>Field-level and form-level validation</li>
          <li>Async validation support</li>
          <li>Custom validation rules</li>
          <li>Error message management</li>
          <li>Form state tracking</li>
        </ul>
      </div>

      <h2>Basic Form Validation</h2>
      <p>
        Start with a simple form validation pattern using derived values:
      </p>

      <CodeBlock
        language="typescript"
        code={`import { state, derived, action } from 'react-understate';

// Form state
const formData = state({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: '',
}, { name: 'formData' });

const touched = state({
  email: false,
  password: false,
  confirmPassword: false,
  name: false,
  age: false,
}, { name: 'touched' });

const errors = state({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  age: '',
}, { name: 'errors' });

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
export const fieldErrors = derived(() => {
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
}, { name: 'fieldErrors' });

export const isFormValid = derived(() => {
  const data = formData();
  const fieldErrorsValue = fieldErrors();
  
  return Object.keys(data).every(field => {
    const value = data[field as keyof typeof data];
    const error = fieldErrorsValue[field];
    return value && !error;
  });
}, { name: 'isFormValid' });

export const isFormDirty = derived(() => {
  const data = formData();
  return Object.values(data).some(value => value !== '');
}, { name: 'isFormDirty' });

// Actions
export const setFieldValue = action((field: string, value: string) => {
  console.log('action: setting field value', field, value);
  formData(prev => ({ ...prev, [field]: value }));
}, { name: 'setFieldValue' });

export const setFieldTouched = action((field: string, isTouched: boolean = true) => {
  console.log('action: setting field touched', field, isTouched);
  touched(prev => ({ ...prev, [field]: isTouched }));
}, { name: 'setFieldTouched' });

export const validateField = action((field: string) => {
  console.log('action: validating field', field);
  const data = formData();
  const value = data[field as keyof typeof data];
  const rule = validationRules[field as keyof typeof validationRules];
  
  if (rule) {
    const error = rule(value);
    errors(prev => ({ ...prev, [field]: error }));
  }
}, { name: 'validateField' });

export const validateForm = action(() => {
  console.log('action: validating entire form');
  const data = formData();
  
  Object.keys(data).forEach(field => {
    validateField(field);
  });
}, { name: 'validateForm' });

export const resetForm = action(() => {
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
}, { name: 'resetForm' });`}
      />

      <h2>Advanced Validation Patterns</h2>
      <p>
        More sophisticated validation patterns for complex forms:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Async validation
const asyncValidationState = state({
  email: { validating: false, error: '' },
  username: { validating: false, error: '' },
}, { name: 'asyncValidationState' });

export const validateEmailAsync = action(async (email: string) => {
  console.log('action: validating email async', email);
  
  if (!email) return;
  
  asyncValidationState(prev => ({
    ...prev,
    email: { validating: true, error: '' },
  }));
  
  try {
    const response = await fetch(\`/api/validate-email?email=\${encodeURIComponent(email)}\`);
    const result = await response.json();
    
    if (!result.available) {
      asyncValidationState(prev => ({
        ...prev,
        email: { validating: false, error: 'Email is already taken' },
      }));
    } else {
      asyncValidationState(prev => ({
        ...prev,
        email: { validating: false, error: '' },
      }));
    }
  } catch (error) {
    asyncValidationState(prev => ({
      ...prev,
      email: { validating: false, error: 'Validation failed' },
    }));
  }
}, { name: 'validateEmailAsync' });

// Debounced validation
let validationTimeout: number | null = null;

export const debouncedValidation = action((field: string, value: string) => {
  console.log('action: debounced validation', field, value);
  
  if (validationTimeout) {
    clearTimeout(validationTimeout);
  }
  
  validationTimeout = window.setTimeout(() => {
    if (field === 'email') {
      validateEmailAsync(value);
    } else {
      validateField(field);
    }
  }, 500);
}, { name: 'debouncedValidation' });

// Cross-field validation
export const crossFieldValidation = derived(() => {
  const data = formData();
  const errors: Record<string, string> = {};
  
  // Password confirmation
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Age and email domain validation
  if (data.age && data.email) {
    const age = parseInt(data.age);
    const emailDomain = data.email.split('@')[1];
    
    if (age < 18 && emailDomain === 'company.com') {
      errors.email = 'Company email requires age 18+';
    }
  }
  
  return errors;
}, { name: 'crossFieldValidation' });

// Conditional validation
export const conditionalValidation = derived(() => {
  const data = formData();
  const errors: Record<string, string> = {};
  
  // Only validate phone if user wants notifications
  if (data.wantNotifications && !data.phone) {
    errors.phone = 'Phone number required for notifications';
  }
  
  // Only validate company if user is employed
  if (data.employmentStatus === 'employed' && !data.company) {
    errors.company = 'Company name required for employed users';
  }
  
  return errors;
}, { name: 'conditionalValidation' });`}
      />

      <h2>Form State Management</h2>
      <p>
        Comprehensive form state management with submission handling:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Form submission state
const submissionState = state({
  isSubmitting: false,
  isSubmitted: false,
  submitError: '',
  submitSuccess: false,
}, { name: 'submissionState' });

// Form submission
export const submitForm = action(async () => {
  console.log('action: submitting form');
  
  // Validate form first
  validateForm();
  
  const isValid = isFormValid();
  if (!isValid) {
    console.log('action: form is invalid, not submitting');
    return;
  }
  
  submissionState(prev => ({
    ...prev,
    isSubmitting: true,
    submitError: '',
  }));
  
  try {
    const data = formData();
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }
    
    const result = await response.json();
    
    submissionState(prev => ({
      ...prev,
      isSubmitting: false,
      isSubmitted: true,
      submitSuccess: true,
    }));
    
    // Reset form on success
    resetForm();
    
  } catch (error) {
    submissionState(prev => ({
      ...prev,
      isSubmitting: false,
      submitError: error instanceof Error ? error.message : 'Submission failed',
    }));
  }
}, { name: 'submitForm' });

// Form reset with confirmation
export const resetFormWithConfirmation = action(() => {
  console.log('action: resetting form with confirmation');
  
  if (isFormDirty()) {
    const confirmed = window.confirm(
      'You have unsaved changes. Are you sure you want to reset the form?'
    );
    
    if (!confirmed) return;
  }
  
  resetForm();
  submissionState({
    isSubmitting: false,
    isSubmitted: false,
    submitError: '',
    submitSuccess: false,
  });
}, { name: 'resetFormWithConfirmation' });

// Auto-save functionality
let autoSaveTimeout: number | null = null;

export const autoSave = action(() => {
  console.log('action: auto-saving form');
  
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }
  
  autoSaveTimeout = window.setTimeout(async () => {
    if (isFormDirty() && !isFormValid()) {
      // Don't auto-save invalid forms
      return;
    }
    
    try {
      const data = formData();
      await fetch('/api/auto-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('action: form auto-saved');
    } catch (error) {
      console.error('action: auto-save failed', error);
    }
  }, 2000); // Auto-save after 2 seconds of inactivity
}, { name: 'autoSave' });`}
      />

      <h2>Validation Utilities</h2>
      <p>
        Reusable validation utilities and helpers:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Validation utility functions
export const validators = {
  required: (value: string) => value ? '' : 'This field is required',
  
  minLength: (min: number) => (value: string) =>
    value.length >= min ? '' : \`Must be at least \${min} characters\`,
  
  maxLength: (max: number) => (value: string) =>
    value.length <= max ? '' : \`Must be no more than \${max} characters\`,
  
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
    return num >= min && num <= max ? '' : \`Must be between \${min} and \${max}\`,
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
);`}
      />

      <h2>Using in React Components</h2>
      <p>
        Here's how to use form validation patterns in React components:
      </p>

      <CodeBlock
        language="tsx"
        code={`import React from 'react';
import { useUnderstate } from 'react-understate';
import {
  formData,
  fieldErrors,
  isFormValid,
  isFormDirty,
  submissionState,
  setFieldValue,
  setFieldTouched,
  submitForm,
  resetForm,
} from './formStore';

function ContactForm() {
  const form = useUnderstate(formData);
  const errors = useUnderstate(fieldErrors);
  const isValid = useUnderstate(isFormValid);
  const isDirty = useUnderstate(isFormDirty);
  const submission = useUnderstate(submissionState);

  const handleFieldChange = (field: string, value: string) => {
    setFieldValue(field, value);
    setFieldTouched(field, true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <h2>Contact Form</h2>
      
      {/* Name field */}
      <div className="form-field">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => setFieldTouched('name', true)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      {/* Email field */}
      <div className="form-field">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => setFieldTouched('email', true)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      {/* Password field */}
      <div className="form-field">
        <label htmlFor="password">Password *</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => setFieldTouched('password', true)}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      {/* Confirm Password field */}
      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
          onBlur={() => setFieldTouched('confirmPassword', true)}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
      </div>

      {/* Age field */}
      <div className="form-field">
        <label htmlFor="age">Age *</label>
        <input
          id="age"
          type="number"
          value={form.age}
          onChange={(e) => handleFieldChange('age', e.target.value)}
          onBlur={() => setFieldTouched('age', true)}
          className={errors.age ? 'error' : ''}
        />
        {errors.age && <span className="error-message">{errors.age}</span>}
      </div>

      {/* Form status */}
      {submission.submitError && (
        <div className="error-message form-error">
          {submission.submitError}
        </div>
      )}
      
      {submission.submitSuccess && (
        <div className="success-message">
          Form submitted successfully!
        </div>
      )}

      {/* Form actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={resetForm}
          disabled={!isDirty}
        >
          Reset
        </button>
        
        <button
          type="submit"
          disabled={!isValid || submission.isSubmitting}
        >
          {submission.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      {/* Form info */}
      <div className="form-info">
        <p>Form is {isValid ? 'valid' : 'invalid'}</p>
        <p>Form is {isDirty ? 'dirty' : 'clean'}</p>
      </div>
    </form>
  );
}

// Reusable form field component
function FormField({ 
  field, 
  label, 
  type = 'text', 
  required = false 
}: {
  field: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  const form = useUnderstate(formData);
  const errors = useUnderstate(fieldErrors);
  const value = form[field as keyof typeof form] || '';

  return (
    <div className="form-field">
      <label htmlFor={field}>
        {label} {required && '*'}
      </label>
      <input
        id={field}
        type={type}
        value={value}
        onChange={(e) => setFieldValue(field, e.target.value)}
        onBlur={() => setFieldTouched(field, true)}
        className={errors[field] ? 'error' : ''}
      />
      {errors[field] && (
        <span className="error-message">{errors[field]}</span>
      )}
    </div>
  );
}

export { ContactForm, FormField };`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Validate on blur:</strong> Don't show errors until user has interacted with field
        </li>
        <li>
          <strong>Provide clear error messages:</strong> Help users understand what went wrong
        </li>
        <li>
          <strong>Use debouncing for async validation:</strong> Prevent excessive API calls
        </li>
        <li>
          <strong>Show validation state visually:</strong> Use colors and icons to indicate field status
        </li>
        <li>
          <strong>Handle edge cases:</strong> Empty forms, network errors, etc.
        </li>
        <li>
          <strong>Use TypeScript:</strong> Ensure type safety for form data and validation
        </li>
        <li>
          <strong>Test thoroughly:</strong> Validation logic can be complex and error-prone
        </li>
        <li>
          <strong>Consider accessibility:</strong> Ensure form is usable with screen readers
        </li>
      </ul>

      <h2>Related Patterns</h2>
      <div className={styles.navigation}>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/derived-values" className={styles.navLink}>
          Derived Values Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/derived" className={styles.navLink}>
          derived() API
        </Link>
      </div>
    </div>
  );
};

export default FormValidation;
