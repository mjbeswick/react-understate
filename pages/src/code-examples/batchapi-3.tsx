import { state, batch, useUnderstate } from 'react-understate';

// Form state
const formData = state({
  name: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    zipCode: '',
  },
});

const formErrors = state<Record<string, string>>({});
const isSubmitting = state(false);
const submitStatus = state<'idle' | 'success' | 'error'>('idle');

function resetForm() {
  batch(() => {
    formData.value = {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        zipCode: '',
      },
    };
    formErrors.value = {};
    isSubmitting.value = false;
    submitStatus.value = 'idle';
  });
}

function validateAndSubmit(data: any) {
  const errors: Record<string, string> = {};

  // Validation logic
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.email.includes('@')) errors.email = 'Valid email is required';
  if (!data.phone.trim()) errors.phone = 'Phone is required';

  // Update form state atomically
  batch(() => {
    formErrors.value = errors;
    isSubmitting.value = Object.keys(errors).length === 0;

    if (Object.keys(errors).length === 0) {
      submitStatus.value = 'idle';
      // Form is valid, start submission
    } else {
      submitStatus.value = 'error';
    }
  });

  // If validation passed, submit
  if (Object.keys(errors).length === 0) {
    submitForm(data);
  }
}

async function submitForm(data: any) {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Success - update multiple states
    batch(() => {
      isSubmitting.value = false;
      submitStatus.value = 'success';
      // Keep form data for now
    });

    // Clear form after showing success
    setTimeout(resetForm, 2000);
  } catch (error) {
    batch(() => {
      isSubmitting.value = false;
      submitStatus.value = 'error';
      formErrors.value = { submit: 'Submission failed. Please try again.' };
    });
  }
}

function ContactForm() {
  const {
    formData: data,
    formErrors: errors,
    isSubmitting: submitting,
    submitStatus: status,
  } = useUnderstate({
    formData,
    formErrors,
    isSubmitting,
    submitStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={data.name}
          onChange={e => {
            batch(() => {
              formData.value = { ...data, name: e.target.value };
              // Clear error when user starts typing
              if (errors.name) {
                const newErrors = { ...errors };
                delete newErrors.name;
                formErrors.value = newErrors;
              }
            });
          }}
          placeholder="Name"
          disabled={submitting}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <input
          value={data.email}
          onChange={e => {
            batch(() => {
              formData.value = { ...data, email: e.target.value };
              if (errors.email) {
                const newErrors = { ...errors };
                delete newErrors.email;
                formErrors.value = newErrors;
              }
            });
          }}
          placeholder="Email"
          type="email"
          disabled={submitting}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>

      {status === 'success' && (
        <p className="success">Form submitted successfully!</p>
      )}
      {status === 'error' && errors.submit && (
        <p className="error">{errors.submit}</p>
      )}

      <button type="button" onClick={resetForm} disabled={submitting}>
        Reset Form
      </button>
    </form>
  );
}
