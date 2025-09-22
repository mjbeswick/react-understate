import React from 'react';
import { state, action, useUnderstate } from 'react-understate';

type User = {
  id: number;
  name: string;
  email: string;
};

const users = state<User[]>([]);
const isLoading = state(false);
const error = state<string | null>(null);

// Async action to fetch users
const fetchUsers = action(async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const fetchedUsers = await response.json();
    users.value = fetchedUsers;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch users';
  } finally {
    isLoading.value = false;
  }
}, 'fetchUsers');

// Async action to create a new user
const createUser = action(async (userData: Omit<User, 'id'>) => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const newUser = await response.json();
    users.value = [...users.value, newUser];
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create user';
  } finally {
    isLoading.value = false;
  }
}, 'createUser');

// Async action to update a user
const updateUser = action(async (id: number, updates: Partial<User>) => {
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const updatedUser = await response.json();
    users.value = users.value.map(user =>
      user.id === id ? updatedUser : user,
    );
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update user';
  }
}, 'updateUser');

function UserManager() {
  const {
    users: userList,
    isLoading: loading,
    error: err,
  } = useUnderstate({
    users,
    isLoading,
    error,
  });

  React.useEffect(() => {
    fetchUsers(); // Load users on mount
  }, []);

  const handleCreateUser = () => {
    createUser({
      name: 'New User',
      email: 'new@example.com',
    });
  };

  return (
    <div>
      <h2>User Manager</h2>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: 'red' }}>Error: {err}</p>}

      <button onClick={handleCreateUser} disabled={loading}>
        Create User
      </button>

      <button onClick={fetchUsers} disabled={loading}>
        Refresh
      </button>

      <ul>
        {userList.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button
              onClick={() =>
                updateUser(user.id, { name: user.name + ' Updated' })
              }
              disabled={loading}
            >
              Update
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
