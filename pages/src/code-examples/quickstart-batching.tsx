import { state, batch, useSubscribe } from 'react-understate';

const firstName = state('');
const lastName = state('');

function UserForm() {
  const { firstName: first, lastName: last } = useSubscribe({
    firstName,
    lastName,
  });

  const updateFullName = (first: string, last: string) => {
    // Batch updates to prevent multiple re-renders
    batch(() => {
      firstName.set(first);
      lastName.set(last);
    });
  };

  return (
    <div>
      <p>
        Full Name: {first} {last}
      </p>
      <button onClick={() => updateFullName('Jane', 'Smith')}>
        Update Name
      </button>
    </div>
  );
}
