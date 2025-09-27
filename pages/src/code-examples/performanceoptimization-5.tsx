import { state, batch, useUnderstate } from 'react-understate';

const firstName = state('');
const lastName = state('');
const email = state('');
const phone = state('');

// Without batching - triggers 4 re-renders
const updateUserUnbatched = data => {
  firstName.value = data.firstName;
  lastName.value = data.lastName;
  email.value = data.email;
  phone.value = data.phone;
};

// With batching - triggers only 1 re-render
const updateUserBatched = data => {
  batch(() => {
    firstName.value = data.firstName;
    lastName.value = data.lastName;
    email.value = data.email;
    phone.value = data.phone;
  });
};
