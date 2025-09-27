import { state, derived, useUnderstate } from 'react-understate';

const firstName = state('John');
const lastName = state('Doe');

// Derived value that combines other states
const fullName = derived(() => `${firstName.value} ${lastName.value}`);

function UserDisplay() {
  const {
    firstName: first,
    lastName: last,
    fullName: name,
  } = useUnderstate({
    firstName,
    lastName,
    fullName,
  });

  return (
    <div>
      <p>Full Name: {name}</p>
      <input
        value={first}
        onChange={e => (firstName.value = e.target.value)}
        placeholder="First Name"
      />
      <input
        value={last}
        onChange={e => (lastName.value = e.target.value)}
        placeholder="Last Name"
      />
    </div>
  );
}
