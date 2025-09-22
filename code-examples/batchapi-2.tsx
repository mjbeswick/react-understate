import { state, batch, useUnderstate } from 'react-understate';

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
}