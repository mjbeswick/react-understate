import React, { useEffect } from 'react';
import { useUnderstate } from 'react-understate';
import {
  users,
  isLoading,
  hasError,
  error,
  isEmpty,
  fetchUsersWithCancellation,
  cancelCurrentRequest,
  clearError,
  userResource,
} from './userStore';

// Basic usage
function UserList() {
  const userList = useUnderstate(users);
  const loading = useUnderstate(isLoading);
  const hasErr = useUnderstate(hasError);
  const errorMsg = useUnderstate(error);
  const empty = useUnderstate(isEmpty);

  useEffect(() => {
    // Fetch on mount
    fetchUsersWithCancellation();
    
    // Cancel on unmount
    return () => {
      cancelCurrentRequest();
    };
  }, []);

  if (loading) {
    return (
      <div>
        Loading users...
        <button onClick={cancelCurrentRequest}>Cancel</button>
      </div>
    );
  }

  if (hasErr) {
    return (
      <div>
        <p>Error: {errorMsg}</p>
        <button onClick={clearError}>Dismiss</button>
        <button onClick={fetchUsersWithCancellation}>Retry</button>
      </div>
    );
  }

  if (empty) {
    return <p>No users found.</p>;
  }

  return (
    <div>
      <h2>Users</h2>
      <button onClick={() => fetchUsersWithCancellation()}>
        Refresh
      </button>
      <ul>
        {userList.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

// Using resource manager
function UserListWithResource() {
  const data = useUnderstate(userResource.data);
  const loading = useUnderstate(userResource.loading);
  const error = useUnderstate(userResource.error);
  const isStale = useUnderstate(userResource.isStale);

  useEffect(() => {
    userResource.fetch();
    
    return () => {
      userResource.cancel();
    };
  }, []);

  return (
    <div>
      {isStale && <p>Data may be outdated</p>}
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div>
          <p>Error: {error}</p>
          <button onClick={userResource.clearError}>Dismiss</button>
          <button onClick={userResource.refresh}>Retry</button>
        </div>
      )}
      
      {data && (
        <div>
          <button onClick={userResource.refresh}>
            Refresh {loading ? '(Loading...)' : ''}
          </button>
          <ul>
            {data.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { UserList, UserListWithResource };