import { state, useUnderstate } from 'react-understate';

const user = state(null, 'user');
const userSettings = state(null, 'userSettings');
const publicData = state({}, 'publicData');

function Dashboard() {
  const { user: currentUser } = useUnderstate({ user });
  
  // Conditional subscription based on auth state
  if (!currentUser) {
    // Only subscribe to public data when not logged in
    const { publicData: data } = useUnderstate({ publicData });
    
    return (
      <div>
        <h1>Public Dashboard</h1>
        <div>Public info: {JSON.stringify(data)}</div>
        <button onClick={() => user.value = { id: 1, name: 'John' }}>
          Log In
        </button>
      </div>
    );
  }
  
  // Subscribe to user-specific data when logged in
  const { userSettings: settings } = useUnderstate({ userSettings });
  
  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      <div>Settings: {JSON.stringify(settings)}</div>
      <button onClick={() => user.value = null}>Log Out</button>
    </div>
  );
}