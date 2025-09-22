import { action } from 'react-understate';
import { users, error } from './async-basic-store';

export const addUserOptimistic = action(
  async (newUser: { name: string; email: string }) => {
    console.log('action: adding user optimistically');

    const optimisticId = Date.now();
    const optimisticUser = { ...newUser, id: optimisticId } as {
      id: number;
      name: string;
      email: string;
    };

    const currentUsers = users();
    users([...currentUsers, optimisticUser]);

    const controller = new AbortController();
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(`Failed to add user: ${response.statusText}`);
      const savedUser = await response.json();
      users(prev =>
        prev.map(user => (user.id === optimisticId ? savedUser : user)),
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      users(prev => prev.filter(user => user.id !== optimisticId));
      error(err instanceof Error ? err.message : 'Failed to add user');
      throw err;
    }
  },
  { name: 'addUserOptimistic' },
);

export const deleteUserOptimistic = action(
  async (userId: number) => {
    console.log('action: deleting user optimistically');

    const originalUsers = users();
    users(prev => prev.filter(user => user.id !== userId));

    const controller = new AbortController();
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(`Failed to delete user: ${response.statusText}`);
    } catch (err) {
      users(originalUsers);
      error(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  },
  { name: 'deleteUserOptimistic' },
);
