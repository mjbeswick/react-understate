// Async validation
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
    const response = await fetch(`/api/validate-email?email=${encodeURIComponent(email)}`);
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
}, { name: 'conditionalValidation' });