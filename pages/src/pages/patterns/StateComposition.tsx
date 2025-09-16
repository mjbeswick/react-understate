import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const StateComposition: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>State Composition</h1>
        <p className={styles.subtitle}>
          Combine multiple states into cohesive, reusable modules
        </p>
      </header>

      <h2>Overview</h2>
      <p>
        State Composition is a pattern for combining multiple related states
        into cohesive modules that provide a clean API for complex
        functionality. This pattern is especially useful for building reusable
        components and managing complex application state.
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
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Benefits</h3>
        <ul style={{ margin: 0 }}>
          <li>Encapsulates related state and logic</li>
          <li>Creates reusable state modules</li>
          <li>Provides clean, predictable APIs</li>
          <li>Enables easy testing and mocking</li>
          <li>Supports dependency injection</li>
        </ul>
      </div>

      <h2>State Factory Pattern</h2>
      <p>
        Create reusable state factories that can be instantiated multiple times
        with different configurations:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state } from 'react-understate';

// Create reusable state factories
function createCounterState(initialValue = 0) {
  const count = state(initialValue);
  
  return {
    count,
    increment: () => count.value++,
    decrement: () => count.value--,
    reset: () => count.value = initialValue,
    setValue: (value: number) => count.value = value,
  };
}

// Use in different parts of your app
const headerCounter = createCounterState(0);
const sidebarCounter = createCounterState(10);
const modalCounter = createCounterState(5);

// Each instance is independent
headerCounter.increment(); // Only affects headerCounter
sidebarCounter.setValue(20); // Only affects sidebarCounter`}
      />

      <h2>Complex State Composition</h2>
      <p>
        Compose multiple states with derived values and actions to create
        sophisticated state modules:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived, action, batch } from 'react-understate';

// Compose multiple states into a cohesive module
const cart = {
  // State
  items: state([]),
  discount: state(0),
  shipping: state(0),
  taxRate: state(0.08),
  
  // Derived values
  subtotal: derived(() => {
    return cart.items.value.reduce((sum, item) => sum + item.price, 0);
  }),
  
  discountAmount: derived(() => {
    return cart.subtotal.value * (cart.discount.value / 100);
  }),
  
  total: derived(() => {
    const subtotal = cart.subtotal.value;
    const discount = cart.discountAmount.value;
    const shipping = cart.shipping.value;
    const tax = (subtotal - discount + shipping) * cart.taxRate.value;
    
    return subtotal - discount + shipping + tax;
  }),
  
  // Actions
  addItem: action((item) => {
    cart.items.value = [...cart.items.value, item];
  }, 'addItem'),
  
  removeItem: action((itemId) => {
    cart.items.value = cart.items.value.filter(item => item.id !== itemId);
  }, 'removeItem'),
  
  updateQuantity: action((itemId, quantity) => {
    cart.items.value = cart.items.value.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
  }, 'updateQuantity'),
  
  applyDiscount: action((percentage) => {
    cart.discount.value = percentage;
  }, 'applyDiscount'),
  
  setShipping: action((cost) => {
    cart.shipping.value = cost;
  }, 'setShipping'),
  
  // Complex actions that work with multiple states
  clearCart: action(() => {
    batch(() => {
      cart.items.value = [];
      cart.discount.value = 0;
      cart.shipping.value = 0;
    });
  }, 'clearCart'),
  
  // Async actions
  checkout: action(async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.value,
          discount: cart.discount.value,
          shipping: cart.shipping.value,
          total: cart.total.value,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Checkout failed');
      }
      
      cart.clearCart();
      return await response.json();
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, 'checkout'),
};`}
      />

      <h2>Form State Composition</h2>
      <p>
        Create reusable form state modules that handle validation, submission,
        and error states:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived, action } from 'react-understate';

function createFormState<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
) {
  const values = state(initialValues);
  const errors = state({} as Partial<Record<keyof T, string>>);
  const touched = state({} as Partial<Record<keyof T, boolean>>);
  const isSubmitting = state(false);
  
  // Derived values
  const isValid = derived(() => {
    return Object.values(errors.value).every(error => !error);
  });
  
  const isDirty = derived(() => {
    return JSON.stringify(values.value) !== JSON.stringify(initialValues);
  });
  
  // Actions
  const setValue = action((field: keyof T, value: any) => {
    values.value = { ...values.value, [field]: value };
    
    // Clear error when user starts typing
    if (errors.value[field]) {
      errors.value = { ...errors.value, [field]: undefined };
    }
  }, 'setValue');
  
  const setTouched = action((field: keyof T) => {
    touched.value = { ...touched.value, [field]: true };
  }, 'setTouched');
  
  const validate = action(() => {
    if (!validationRules) return true;
    
    const newErrors = {} as Partial<Record<keyof T, string>>;
    
    for (const [field, rule] of Object.entries(validationRules)) {
      const value = values.value[field as keyof T];
      const error = rule(value);
      if (error) {
        newErrors[field as keyof T] = error;
      }
    }
    
    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  }, 'validate');
  
  const reset = action(() => {
    values.value = initialValues;
    errors.value = {};
    touched.value = {};
    isSubmitting.value = false;
  }, 'reset');
  
  const submit = action(async (onSubmit: (values: T) => Promise<void>) => {
    if (!validate()) return false;
    
    isSubmitting.value = true;
    
    try {
      await onSubmit(values.value);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }, 'submit');
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    setValue,
    setTouched,
    validate,
    reset,
    submit,
  };
}

// Usage
const userForm = createFormState(
  { name: '', email: '', age: 0 },
  {
    name: (value) => value.length < 2 ? 'Name must be at least 2 characters' : null,
    email: (value) => !value.includes('@') ? 'Invalid email' : null,
    age: (value) => value < 18 ? 'Must be 18 or older' : null,
  }
);`}
      />

      <h2>State Module with Dependencies</h2>
      <p>
        Create state modules that depend on other modules, enabling complex
        application architectures:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived, action } from 'react-understate';

// Base user state
const userState = {
  profile: state({ id: null, name: '', email: '' }),
  isAuthenticated: state(false),
  
  login: action(async (credentials) => {
    // Login logic...
    userState.isAuthenticated.value = true;
  }, 'login'),
  
  logout: action(() => {
    userState.profile.value = { id: null, name: '', email: '' };
    userState.isAuthenticated.value = false;
  }, 'logout'),
};

// Preferences that depend on user
const preferencesState = {
  theme: state('light'),
  language: state('en'),
  notifications: state(true),
  
  // Derived from user state
  canEdit: derived(() => userState.isAuthenticated.value),
  
  updateTheme: action((theme) => {
    if (preferencesState.canEdit.value) {
      preferencesState.theme.value = theme;
    }
  }, 'updateTheme'),
};

// Settings that depend on both user and preferences
const settingsState = {
  autoSave: state(true),
  syncEnabled: state(false),
  
  // Derived from multiple states
  isFullyConfigured: derived(() => {
    return userState.isAuthenticated.value && 
           preferencesState.theme.value !== 'light' &&
           settingsState.autoSave.value;
  }),
  
  // Actions that work across modules
  resetAll: action(() => {
    preferencesState.theme.value = 'light';
    preferencesState.language.value = 'en';
    settingsState.autoSave.value = true;
    settingsState.syncEnabled.value = false;
  }, 'resetAll'),
};`}
      />

      <h2>Best Practices</h2>

      <h3>Keep Modules Focused</h3>
      <p>
        Each state module should have a single responsibility. If a module is
        getting too large, consider splitting it into smaller, focused modules.
      </p>

      <h3>Use TypeScript for Better APIs</h3>
      <p>
        Define clear interfaces for your state modules to provide better
        developer experience and catch errors at compile time.
      </p>

      <h3>Compose at the Right Level</h3>
      <p>
        Compose state at the appropriate level of your application. Low-level
        utilities can be highly reusable, while high-level application state
        should be specific to your domain.
      </p>

      <h2>Next Steps</h2>
      <p>
        Now that you understand state composition, explore these related topics:
      </p>

      <div className={styles.navigation}>
        <Link to="/patterns/store-pattern" className={styles.navLink}>
          Store Pattern
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/patterns/async-data" className={styles.navLink}>
          Async Data Loading
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/guides/state-management" className={styles.navLink}>
          State Management Guide
        </Link>
        <span className={styles.navLabel}>•</span>
        <Link to="/api/state" className={styles.navLink}>
          state() API Reference
        </Link>
      </div>
    </div>
  );
};

export default StateComposition;
