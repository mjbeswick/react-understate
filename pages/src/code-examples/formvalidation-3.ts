// Form submission state
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
}, { name: 'autoSave' });