import { state, action, batch } from 'react-understate';

const formData = state({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const updateForm = action((newData) => {
  batch(() => {
    formData.value = { ...formData.value, ...newData };
  });
}, 'updateForm');

const resetForm = action(() => {
  batch(() => {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    };
  });
}, 'resetForm');