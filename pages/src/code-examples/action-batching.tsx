import { state, action, batch } from 'react-understate';

const firstName = state('');
const lastName = state('');
const email = state('');
const phone = state('');

// Without batching - triggers 4 re-renders
const updateUserUnbatched = action((data: any) => {
  firstName.value = data.firstName;
  lastName.value = data.lastName;
  email.value = data.email;
  phone.value = data.phone;
}, 'updateUserUnbatched');

// With batching - triggers only 1 re-render
const updateUserBatched = action((data: any) => {
  batch(() => {
    firstName.value = data.firstName;
    lastName.value = data.lastName;
    email.value = data.email;
    phone.value = data.phone;
  });
}, 'updateUserBatched');

// Complex batched operations
const processFormSubmission = action(async (formData: any) => {
  // Validation and preparation...

  batch(() => {
    // Update multiple related states atomically
    firstName.value = formData.firstName.trim();
    lastName.value = formData.lastName.trim();
    email.value = formData.email.toLowerCase();
    phone.value = formData.phone.replace(/\D/g, '');
  });

  // Continue with async operations...
}, 'processFormSubmission');
