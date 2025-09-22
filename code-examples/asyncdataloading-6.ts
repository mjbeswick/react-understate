export const addUserOptimistic = action(async (newUser: Omit<User, 'id'>) => {
  console.log('action: adding user optimistically');
  
  // Generate optimistic ID
  const optimisticId = Date.now();
  const optimisticUser: User = { ...newUser, id: optimisticId };
  
  // Immediately add to UI
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
    
    if (!response.ok) {
      throw new Error(`Failed to add user: ${response.statusText}`);
    }
    
    const savedUser: User = await response.json();
    
    // Replace optimistic user with real user
    users(prev => prev.map(user => 
      user.id === optimisticId ? savedUser : user
    ));
    
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    
    // Roll back optimistic update
    users(prev => prev.filter(user => user.id !== optimisticId));
    
    // Show error
    error(err instanceof Error ? err.message : 'Failed to add user');
    throw err;
  }
}, { name: 'addUserOptimistic' });

export const deleteUserOptimistic = action(async (userId: number) => {
  console.log('action: deleting user optimistically');
  
  // Store original state for rollback
  const originalUsers = users();
  
  // Immediately remove from UI
  users(prev => prev.filter(user => user.id !== userId));
  
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
    
    // Success - no need to update UI, already removed
    
  } catch (err) {
    // Roll back - restore original state
    users(originalUsers);
    
    error(err instanceof Error ? err.message : 'Failed to delete user');
    throw err;
  }
}, { name: 'deleteUserOptimistic' });