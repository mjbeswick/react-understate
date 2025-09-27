import { state, asyncDerived, useUnderstate } from 'react-understate';

const userId = state(1);

// Async derived value that fetches user data
const userData = asyncDerived(async () => {
  const response = await fetch(`/api/users/${userId.value}`);
  return response.json();
}, null); // Initial value while loading

const userPermissions = asyncDerived(async () => {
  if (!userData.value) return [];

  const response = await fetch(`/api/users/${userData.value.id}/permissions`);
  return response.json();
}, []);

function UserProfile() {
  const {
    userId: id,
    userData: user,
    userPermissions: permissions,
  } = useUnderstate({
    userId,
    userData,
    userPermissions,
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

      <button onClick={() => (userId.value = userId.value + 1)}>
        Next User
      </button>
    </div>
  );
}
