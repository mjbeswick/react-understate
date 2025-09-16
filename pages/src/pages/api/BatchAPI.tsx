import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';

const BatchAPI: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>batch()</h1>
        <p className={styles.subtitle}>
          Group multiple state updates to prevent unnecessary re-renders
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signature</h2>
        <div className={styles.apiSignature}>
          batch(fn: () =&gt; void): void
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>fn</span>
            <span className={styles.parameterType}>() =&gt; void</span>
            <div className={styles.parameterDescription}>
              A function that contains multiple state updates. All state changes
              within this function will be batched together and applied
              atomically.
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>batch()</code> function allows you to group multiple state
        updates together, ensuring that React components only re-render once
        after all updates are complete. This is essential for performance when
        updating multiple related states.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>⚡ Performance</div>
          <div className={styles.featureDescription}>
            Prevents multiple re-renders when updating several states
            simultaneously.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔄 Atomic Updates</div>
          <div className={styles.featureDescription}>
            All state changes happen atomically - components see all updates at
            once.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Consistency</div>
          <div className={styles.featureDescription}>
            Prevents intermediate states where some updates are applied but
            others aren't.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧠 Automatic</div>
          <div className={styles.featureDescription}>
            Many operations are automatically batched. Manual batching is for
            complex scenarios.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Basic Usage</h2>

        <h3>Without Batching (Multiple Re-renders)</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, useUnderstate } from 'react-understate';

const firstName = state('');
const lastName = state('');
const email = state('');

function updateUser(userData: any) {
  // ❌ This triggers 3 separate re-renders
  firstName.value = userData.firstName;
  lastName.value = userData.lastName; 
  email.value = userData.email;
}

function UserForm() {
  const { firstName: first, lastName: last, email: userEmail } = useUnderstate({
    firstName,
    lastName,
    email
  });
  
  console.log('Component rendered'); // This logs 3 times!
  
  return (
    <div>
      <p>{first} {last} - {userEmail}</p>
      <button onClick={() => updateUser({
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john@example.com'
      })}>
        Update User
      </button>
    </div>
  );
}`}
        />

        <h3>With Batching (Single Re-render)</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, batch, useUnderstate } from 'react-understate';

const firstName = state('');
const lastName = state('');
const email = state('');

function updateUser(userData: any) {
  // ✅ This triggers only 1 re-render
  batch(() => {
    firstName.value = userData.firstName;
    lastName.value = userData.lastName; 
    email.value = userData.email;
  });
}

function UserForm() {
  const { firstName: first, lastName: last, email: userEmail } = useUnderstate({
    firstName,
    lastName,
    email
  });
  
  console.log('Component rendered'); // This logs only once!
  
  return (
    <div>
      <p>{first} {last} - {userEmail}</p>
      <button onClick={() => updateUser({
        firstName: 'John',
        lastName: 'Doe', 
        email: 'john@example.com'
      })}>
        Update User
      </button>
    </div>
  );
}`}
        />

        <h3>Complex Form Updates</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, batch, useUnderstate } from 'react-understate';

// Form state
const formData = state({
  name: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    zipCode: ''
  }
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
        zipCode: ''
      }
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
    submitStatus: status
  } = useUnderstate({
    formData,
    formErrors,
    isSubmitting,
    submitStatus
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
          onChange={(e) => {
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
          onChange={(e) => {
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
      
      {status === 'success' && <p className="success">Form submitted successfully!</p>}
      {status === 'error' && errors.submit && <p className="error">{errors.submit}</p>}
      
      <button type="button" onClick={resetForm} disabled={submitting}>
        Reset Form
      </button>
    </form>
  );
}`}
        />
      </div>

      <h2>When to Use Batching</h2>

      <h3>Multiple Related Updates</h3>
      <p>
        Use batching when updating multiple states that represent related data:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, batch } from 'react-understate';

const user = state({ name: '', age: 0 });
const userStats = state({ loginCount: 0, lastLogin: null });
const userPrefs = state({ theme: 'light', lang: 'en' });

// ✅ Good - batch related user updates
function loadUserProfile(userData: any) {
  batch(() => {
    user.value = { name: userData.name, age: userData.age };
    userStats.value = { 
      loginCount: userData.loginCount, 
      lastLogin: userData.lastLogin 
    };
    userPrefs.value = { 
      theme: userData.preferences.theme,
      lang: userData.preferences.language
    };
  });
}

// ❌ Less ideal - separate updates cause multiple renders
function loadUserProfileUnbatched(userData: any) {
  user.value = { name: userData.name, age: userData.age };
  userStats.value = { loginCount: userData.loginCount, lastLogin: userData.lastLogin };
  userPrefs.value = { theme: userData.preferences.theme, lang: userData.preferences.language };
}`}
      />

      <h3>State Transitions</h3>
      <p>
        Batch updates when transitioning between different application states:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, batch } from 'react-understate';

const currentView = state('home');
const isLoading = state(false);
const data = state(null);
const error = state(null);

// ✅ Batch state transition updates
function navigateToProfile(userId: string) {
  batch(() => {
    currentView.value = 'profile';
    isLoading.value = true;
    error.value = null;
    data.value = null; // Clear previous data
  });
  
  // Then load new data
  loadProfileData(userId);
}

function handleDataLoad(result: any) {
  batch(() => {
    data.value = result;
    isLoading.value = false;
    error.value = null;
  });
}

function handleError(err: Error) {
  batch(() => {
    data.value = null;
    isLoading.value = false;
    error.value = err.message;
  });
}`}
      />

      <h3>List Operations</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, batch } from 'react-understate';

const items = state<Array<{ id: number; name: string; selected: boolean }>>([]);
const selectedCount = state(0);
const allSelected = state(false);

function toggleAllItems() {
  const shouldSelectAll = !allSelected.value;
  
  batch(() => {
    // Update all items
    items.value = items.value.map(item => ({
      ...item,
      selected: shouldSelectAll
    }));
    
    // Update derived states
    selectedCount.value = shouldSelectAll ? items.value.length : 0;
    allSelected.value = shouldSelectAll;
  });
}

function toggleItem(id: number) {
  const newItems = items.value.map(item =>
    item.id === id ? { ...item, selected: !item.selected } : item
  );
  
  const newSelectedCount = newItems.filter(item => item.selected).length;
  const newAllSelected = newSelectedCount === newItems.length;
  
  batch(() => {
    items.value = newItems;
    selectedCount.value = newSelectedCount;
    allSelected.value = newAllSelected;
  });
}

function deleteSelectedItems() {
  const remainingItems = items.value.filter(item => !item.selected);
  
  batch(() => {
    items.value = remainingItems;
    selectedCount.value = 0;
    allSelected.value = false;
  });
}`}
      />

      <h2>Nested Batching</h2>
      <p>
        Batches can be nested - the outermost batch controls when updates are
        flushed:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, batch } from 'react-understate';

const a = state(0);
const b = state(0);
const c = state(0);

function updateAB() {
  batch(() => {
    a.value = 1;
    b.value = 2;
  });
}

function updateAll() {
  batch(() => {
    updateAB(); // This batch is merged into the outer batch
    c.value = 3;
  });
  // All three updates (a, b, c) happen in a single re-render
}

// More complex nesting
function complexUpdate() {
  batch(() => {
    a.value = 10;
    
    batch(() => {
      b.value = 20;
      
      batch(() => {
        c.value = 30;
      });
    });
    
    // More updates at outer level
    a.value = a.value + 1; // Now 11
  });
  // Components re-render once with a=11, b=20, c=30
}`}
      />

      <h2>Automatic Batching</h2>
      <p>
        React Understate automatically batches updates in many scenarios. Manual
        batching is primarily needed for complex update patterns:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, action } from 'react-understate';

const count = state(0);
const message = state('');

// ✅ Automatically batched in event handlers
function handleClick() {
  count.value++; // These updates are automatically
  message.value = \`Count is \${count.value}\`; // batched together
}

// ✅ Automatically batched in actions
const incrementWithMessage = action(() => {
  count.value++;
  message.value = \`Count is \${count.value}\`;
});

// ❌ May need manual batching in async contexts
async function handleAsyncUpdate() {
  const result = await fetchData();
  
  // These might not be automatically batched
  batch(() => {
    count.value = result.count;
    message.value = result.message;
  });
}

// ✅ Automatically batched in setTimeout/promises in React 18+
function delayedUpdate() {
  setTimeout(() => {
    count.value++; // Automatically batched in React 18+
    message.value = 'Updated!';
  }, 1000);
}`}
      />

      <h2>Performance Best Practices</h2>

      <h3>Minimize Batch Scope</h3>
      <CodeBlock
        language="tsx"
        code={`// ❌ Overly broad batching
function processLargeDataset(data: any[]) {
  batch(() => {
    // Long running operation inside batch
    const processed = data.map(item => expensiveProcessing(item));
    
    results.value = processed;
    isLoading.value = false;
  });
}

// ✅ Batch only the state updates
function processLargeDataset(data: any[]) {
  // Do expensive work outside batch
  const processed = data.map(item => expensiveProcessing(item));
  
  // Batch only the state updates
  batch(() => {
    results.value = processed;
    isLoading.value = false;
  });
}`}
      />

      <h3>Conditional Batching</h3>
      <CodeBlock
        language="tsx"
        code={`function updateItems(updates: Array<{ id: number; changes: any }>) {
  if (updates.length === 1) {
    // Single update - no need to batch
    const update = updates[0];
    const newItems = items.value.map(item =>
      item.id === update.id ? { ...item, ...update.changes } : item
    );
    items.value = newItems;
    
  } else {
    // Multiple updates - use batching
    batch(() => {
      let newItems = items.value;
      
      updates.forEach(update => {
        newItems = newItems.map(item =>
          item.id === update.id ? { ...item, ...update.changes } : item
        );
      });
      
      items.value = newItems;
      lastUpdateCount.value = updates.length;
      lastUpdateTime.value = Date.now();
    });
  }
}`}
      />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/effect" className={styles.navLink}>
            ← effect()
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/use-understate" className={styles.navLink}>
            useUnderstate() →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BatchAPI;
