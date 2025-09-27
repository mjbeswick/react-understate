// ❌ Inefficient - accesses entire user object
const userDisplay = derived(() => {
  const user = fullUserObject(); // Large object with many properties
  return `${user.firstName} ${user.lastName} (${user.email})`;
});

// ✅ Efficient - only depends on specific properties
const firstName = state('John');
const lastName = state('Doe');
const email = state('john@example.com');

const userDisplay = derived(() => {
  return `${firstName.value} ${lastName.value} (${email.value})`;
});
