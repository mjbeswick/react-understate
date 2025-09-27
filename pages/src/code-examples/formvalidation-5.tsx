import React from 'react';
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
          onChange={e => handleFieldChange('name', e.target.value)}
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
          onChange={e => handleFieldChange('email', e.target.value)}
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
          onChange={e => handleFieldChange('password', e.target.value)}
          onBlur={() => setFieldTouched('password', true)}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>

      {/* Confirm Password field */}
      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={e => handleFieldChange('confirmPassword', e.target.value)}
          onBlur={() => setFieldTouched('confirmPassword', true)}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      {/* Age field */}
      <div className="form-field">
        <label htmlFor="age">Age *</label>
        <input
          id="age"
          type="number"
          value={form.age}
          onChange={e => handleFieldChange('age', e.target.value)}
          onBlur={() => setFieldTouched('age', true)}
          className={errors.age ? 'error' : ''}
        />
        {errors.age && <span className="error-message">{errors.age}</span>}
      </div>

      {/* Form status */}
      {submission.submitError && (
        <div className="error-message form-error">{submission.submitError}</div>
      )}

      {submission.submitSuccess && (
        <div className="success-message">Form submitted successfully!</div>
      )}

      {/* Form actions */}
      <div className="form-actions">
        <button type="button" onClick={resetForm} disabled={!isDirty}>
          Reset
        </button>

        <button type="submit" disabled={!isValid || submission.isSubmitting}>
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
  required = false,
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
        onChange={e => setFieldValue(field, e.target.value)}
        onBlur={() => setFieldTouched(field, true)}
        className={errors[field] ? 'error' : ''}
      />
      {errors[field] && <span className="error-message">{errors[field]}</span>}
    </div>
  );
}

export { ContactForm, FormField };
