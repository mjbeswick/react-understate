import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StateAPI.module.css';
import CodeBlock from '../../components/CodeBlock';

const DerivedAPIContent: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>derived()</h1>
        <p className={styles.subtitle}>
          Create computed values that automatically update when dependencies
          change
        </p>
      </header>

      <div className={styles.apiSection}>
        <h2>Function Signature</h2>
        <div className={styles.apiSignature}>
          derived&lt;T&gt;(computeFn: () =&gt; T, debugName?: string):
          DerivedState&lt;T&gt;
        </div>

        <div className={styles.parameterList}>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>computeFn</span>
            <span className={styles.parameterType}>() =&gt; T</span>
            <div className={styles.parameterDescription}>
              A function that computes the derived value. It should read from
              other states and return the computed result. The function will be
              re-executed automatically when any of the states it reads from
              change.
            </div>
          </div>
          <div className={styles.parameter}>
            <span className={styles.parameterName}>debugName</span>
            <span className={styles.parameterType}>string (optional)</span>
            <div className={styles.parameterDescription}>
              A name for the derived value. If not provided, the function name
              will be used.
            </div>
          </div>
        </div>
      </div>

      <h2>Overview</h2>
      <p>
        The <code>derived()</code> function creates computed values that
        automatically update when their dependencies change. Derived values are
        read-only and lazy - they only recalculate when accessed and when their
        dependencies have changed.
      </p>

      <div className={styles.featureGrid}>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🧠 Automatic Dependencies</div>
          <div className={styles.featureDescription}>
            Automatically tracks which states your computation depends on. No
            manual dependency arrays.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>⚡ Lazy Evaluation</div>
          <div className={styles.featureDescription}>
            Only recalculates when the value is actually accessed and
            dependencies have changed.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🔒 Read-Only</div>
          <div className={styles.featureDescription}>
            Derived values are immutable. They can only be changed by updating
            their dependencies.
          </div>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureTitle}>🎯 Efficient</div>
          <div className={styles.featureDescription}>
            Uses memoization and reference equality to prevent unnecessary
            recalculations.
          </div>
        </div>
      </div>

      <div className={styles.exampleSection}>
        <h2>Basic Examples</h2>

        <h3>Simple Computation</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, derived, useUnderstate } from 'react-understate';

const firstName = state('John');
const lastName = state('Doe');

// Derived value that combines other states
const fullName = derived(() => \`\${firstName.value} \${lastName.value}\`);

function UserDisplay() {
  const { firstName: first, lastName: last, fullName: name } = useUnderstate({
    firstName,
    lastName,
    fullName
  });
  
  return (
    <div>
      <p>Full Name: {name}</p>
      <input 
        value={first}
        onChange={(e) => firstName.value = e.target.value}
        placeholder="First Name"
      />
      <input 
        value={last}
        onChange={(e) => lastName.value = e.target.value}
        placeholder="Last Name"
      />
    </div>
  );
}`}
        />

        <h3>Mathematical Computations</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, derived, useUnderstate } from 'react-understate';

const radius = state(5);
const pi = 3.14159;

// Multiple derived values
const diameter = derived(() => radius.value * 2);
const circumference = derived(() => 2 * pi * radius.value);
const area = derived(() => pi * Math.pow(radius.value, 2));

function CircleCalculator() {
  const { radius: r, diameter: d, circumference: c, area: a } = useUnderstate({
    radius,
    diameter,
    circumference,
    area
  });
  
  return (
    <div>
      <h3>Circle Calculator</h3>
      <label>
        Radius: 
        <input 
          type="number"
          value={r}
          onChange={(e) => radius.value = Number(e.target.value)}
        />
      </label>
      
      <p>Diameter: {d.toFixed(2)}</p>
      <p>Circumference: {c.toFixed(2)}</p>
      <p>Area: {a.toFixed(2)}</p>
    </div>
  );
}`}
        />

        <h3>Complex Object Transformations</h3>
        <CodeBlock
          language="tsx"
          code={`import { state, derived, useUnderstate } from 'react-understate';

const users = state([
  { id: 1, name: 'John', age: 25, active: true },
  { id: 2, name: 'Jane', age: 30, active: false },
  { id: 3, name: 'Bob', age: 35, active: true }
]);

const searchTerm = state('');
const showActiveOnly = state(false);

// Complex filtering and searching
const filteredUsers = derived(() => {
  let result = users.value;
  
  // Filter by search term
  if (searchTerm.value) {
    result = result.filter(user => 
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  
  // Filter by active status
  if (showActiveOnly.value) {
    result = result.filter(user => user.active);
  }
  
  return result;
});

// Statistics derived from filtered data
const userStats = derived(() => {
  const filtered = filteredUsers.value;
  return {
    total: filtered.length,
    averageAge: filtered.length > 0 
      ? filtered.reduce((sum, user) => sum + user.age, 0) / filtered.length 
      : 0,
    activeCount: filtered.filter(user => user.active).length
  };
});

function UserList() {
  const { 
    searchTerm: search, 
    showActiveOnly: activeOnly,
    filteredUsers: users,
    userStats: stats
  } = useUnderstate({
    searchTerm,
    showActiveOnly,
    filteredUsers,
    userStats
  });
  
  return (
    <div>
      <h3>User Management</h3>
      
      <input
        type="text"
        value={search}
        onChange={(e) => searchTerm.value = e.target.value}
        placeholder="Search users..."
      />
      
      <label>
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(e) => showActiveOnly.value = e.target.checked}
        />
        Show active only
      </label>
      
      <div>
        <p>Total: {stats.total} users</p>
        <p>Average Age: {stats.averageAge.toFixed(1)}</p>
        <p>Active: {stats.activeCount}</p>
      </div>
      
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.age}) - {user.active ? 'Active' : 'Inactive'}
          </li>
        ))}
      </ul>
    </div>
  );
}`}
        />
      </div>

      <h2>Derived from Derived</h2>
      <p>
        Derived values can depend on other derived values, creating computation
        chains. React Understate efficiently handles these dependencies.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived } from 'react-understate';

const items = state([
  { name: 'Apple', price: 1.50, quantity: 3 },
  { name: 'Banana', price: 0.75, quantity: 6 },
  { name: 'Orange', price: 2.00, quantity: 2 }
]);

const taxRate = state(0.08); // 8% tax
const discountPercent = state(0); // No discount initially

// First level derivations
const subtotal = derived(() => 
  items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

const discountAmount = derived(() => 
  subtotal.value * (discountPercent.value / 100)
);

// Second level derivations (depend on other derived values)
const subtotalAfterDiscount = derived(() => 
  subtotal.value - discountAmount.value
);

const taxAmount = derived(() => 
  subtotalAfterDiscount.value * taxRate.value
);

// Final derivation
const total = derived(() => 
  subtotalAfterDiscount.value + taxAmount.value
);

// Even more complex derivations
const itemBreakdown = derived(() => {
  return items.value.map(item => ({
    ...item,
    lineTotal: item.price * item.quantity,
    discountedPrice: item.price * (1 - discountPercent.value / 100),
    finalPrice: item.price * (1 - discountPercent.value / 100) * (1 + taxRate.value)
  }));
});

function ShoppingCart() {
  const {
    items: cartItems,
    subtotal: sub,
    discountAmount: discount,
    taxAmount: tax,
    total: finalTotal,
    itemBreakdown: breakdown
  } = useUnderstate({
    items,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    itemBreakdown
  });
  
  return (
    <div>
      <h3>Shopping Cart</h3>
      
      {breakdown.map((item, index) => (
        <div key={index}>
          {item.name}: {item.quantity} × \${item.price} = \${item.lineTotal.toFixed(2)}
        </div>
      ))}
      
      <hr />
      <p>Subtotal: \${sub.toFixed(2)}</p>
      <p>Discount: -\${discount.toFixed(2)}</p>
      <p>Tax: \${tax.toFixed(2)}</p>
      <strong>Total: \${finalTotal.toFixed(2)}</strong>
      
      <div>
        <label>
          Discount %: 
          <input 
            type="number"
            value={discountPercent.value}
            onChange={(e) => discountPercent.value = Number(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}`}
      />

      <h2>Async Derived Values</h2>
      <p>
        React Understate also supports async derived values for handling
        asynchronous computations that depend on state changes.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, asyncDerived, useUnderstate } from 'react-understate';

const userId = state(1);

// Async derived value that fetches user data
const userData = asyncDerived(async () => {
  const response = await fetch(\`/api/users/\${userId.value}\`);
  return response.json();
}, null); // Initial value while loading

const userPermissions = asyncDerived(async () => {
  if (!userData.value) return [];
  
  const response = await fetch(\`/api/users/\${userData.value.id}/permissions\`);
  return response.json();
}, []);

function UserProfile() {
  const { userId: id, userData: user, userPermissions: permissions } = useUnderstate({
    userId,
    userData,
    userPermissions
  });
  
  if (!user) {
    return <div>Loading user data...</div>;
  }
  
  return (
    <div>
      <h3>{user.name}</h3>
      <p>Email: {user.email}</p>
      
      <h4>Permissions:</h4>
      <ul>
        {permissions.map(permission => (
          <li key={permission}>{permission}</li>
        ))}
      </ul>
      
      <button onClick={() => userId.value = userId.value + 1}>
        Next User
      </button>
    </div>
  );
}`}
      />

      <h2>Performance Optimization</h2>

      <h3>Expensive Computations</h3>
      <p>
        Derived values are automatically memoized, but you can optimize
        expensive computations by being strategic about dependencies.
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived } from 'react-understate';

const largeDataset = state([/* thousands of items */]);
const searchTerm = state('');
const sortOrder = state('asc');

// ❌ Inefficient - processes everything on every change
const processedData = derived(() => {
  const filtered = largeDataset.value.filter(item => 
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
  
  return filtered.sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
});

// ✅ More efficient - split into steps
const filteredData = derived(() => 
  largeDataset.value.filter(item => 
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const sortedData = derived(() => {
  const filtered = filteredData.value;
  return [...filtered].sort((a, b) => {
    if (sortOrder.value === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });
});

// Now sorting only happens when sort order changes,
// and filtering only happens when search term or data changes`}
      />

      <h3>Conditional Dependencies</h3>
      <CodeBlock
        language="tsx"
        code={`import { state, derived } from 'react-understate';

const mode = state('simple');
const simpleValue = state(10);
const complexValue = state({ x: 5, y: 15 });

// Conditional computation based on mode
const result = derived(() => {
  if (mode.value === 'simple') {
    // Only depends on simpleValue when in simple mode
    return simpleValue.value * 2;
  } else {
    // Only depends on complexValue when in complex mode
    return complexValue.value.x * complexValue.value.y;
  }
});

// This derived will only recalculate when:
// - mode changes, OR
// - mode is 'simple' AND simpleValue changes, OR  
// - mode is 'complex' AND complexValue changes`}
      />

      <h2>Error Handling</h2>
      <p>Handle errors in derived computations gracefully:</p>

      <CodeBlock
        language="tsx"
        code={`import { state, derived } from 'react-understate';

const inputValue = state('42');

const parsedNumber = derived(() => {
  try {
    const num = parseFloat(inputValue.value);
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    return { value: num, error: null };
  } catch (error) {
    return { value: 0, error: error.message };
  }
});

const calculation = derived(() => {
  const parsed = parsedNumber.value;
  if (parsed.error) {
    return { result: null, error: parsed.error };
  }
  
  try {
    const result = Math.sqrt(parsed.value);
    return { result, error: null };
  } catch (error) {
    return { result: null, error: 'Calculation failed' };
  }
});

function Calculator() {
  const { 
    inputValue: input, 
    parsedNumber: parsed, 
    calculation: calc 
  } = useUnderstate({
    inputValue,
    parsedNumber,
    calculation
  });
  
  return (
    <div>
      <input
        value={input}
        onChange={(e) => inputValue.value = e.target.value}
        placeholder="Enter a number"
      />
      
      {parsed.error && <p style={{ color: 'red' }}>Input Error: {parsed.error}</p>}
      
      {calc.error ? (
        <p style={{ color: 'red' }}>Calculation Error: {calc.error}</p>
      ) : (
        <p>Square Root: {calc.result?.toFixed(2)}</p>
      )}
    </div>
  );
}`}
      />

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/api/state" className={styles.navLink}>
            ← state()
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/api/action" className={styles.navLink}>
            action() →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DerivedAPIContent;
