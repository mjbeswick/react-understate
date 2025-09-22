import { state, effect, derived } from 'react-understate';

const formData = state({
  email: '',
  password: '',
  confirmPassword: ''
}, 'formData');

const validationErrors = state({}, 'validationErrors');

// Email validation effect
effect(() => {
  const { email } = formData.value;
  const errors = { ...validationErrors.value };
  
  if (email && !email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  } else {
    delete errors.email;
  }
  
  validationErrors.value = errors;
}, 'validateEmail');

// Password validation effect
effect(() => {
  const { password, confirmPassword } = formData.value;
  const errors = { ...validationErrors.value };
  
  if (password && password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else {
    delete errors.password;
  }
  
  if (confirmPassword && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  } else {
    delete errors.confirmPassword;
  }
  
  validationErrors.value = errors;
}, 'validatePassword');

// Derived form validity
const isFormValid = derived(() => {
  const { email, password, confirmPassword } = formData.value;
  const errors = validationErrors.value;
  
  return email && password && confirmPassword && 
         Object.keys(errors).length === 0;
}, 'isFormValid');

// Usage
formData.value = { ...formData.value, email: 'invalid-email' };
// Automatically sets validationErrors.email

formData.value = { ...formData.value, email: 'user@example.com' };
// Automatically clears validationErrors.email