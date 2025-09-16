// Direct access (outside React components)
const currentCount = count();
const currentUser = user();

// In React components - single state
function Counter() {
  const countValue = useUnderstate(count);
  return <div>Count: {countValue}</div>;
}

// In React components - multiple states
function UserProfile() {
  const { user: userData, count: countValue } = useUnderstate({
    user,
    count,
  });
  
  return (
    <div>
      <h1>{userData.name}</h1>
      <p>Count: {countValue}</p>
    </div>
  );
}

// Selective subscription (performance optimization)
function UserName() {
  // Only re-renders when user.name changes
  const userName = useUnderstate(derived(() => user().name));
  return <h1>{userName}</h1>;
}

// Conditional subscription
function ConditionalDisplay() {
  const { isVisible: visible, message: msg } = useUnderstate({
    isVisible,
    message: isVisible() ? message : state(''), // Only subscribe when visible
  });
  
  return visible ? <p>{msg}</p> : null;
}