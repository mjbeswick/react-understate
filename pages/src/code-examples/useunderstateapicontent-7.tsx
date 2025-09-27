import { state, derived, useUnderstate, action } from 'react-understate';

// Large application store
const appStore = {
  // User data
  user: state(null, 'user'),
  userPreferences: state({}, 'userPreferences'),
  userHistory: state([], 'userHistory'),

  // App data
  currentPage: state('home', 'currentPage'),
  sidebarOpen: state(false, 'sidebarOpen'),
  notifications: state([], 'notifications'),

  // Heavy computed data
  expensiveComputation: derived(() => {
    // Expensive calculation
    return computeExpensiveData(appStore.user.value);
  }, 'expensiveComputation'),

  // Actions
  toggleSidebar: action(() => {
    appStore.sidebarOpen.value = !appStore.sidebarOpen.value;
  }, 'toggleSidebar'),
};

// ❌ Bad: Subscribes to entire store
function BadComponent() {
  // This component re-renders when ANY state changes
  const everything = useUnderstate(appStore);

  return <div>{everything.currentPage}</div>;
}

// ✅ Good: Subscribe only to needed states
function GoodComponent() {
  // Only subscribes to currentPage - no re-renders for other changes
  const { currentPage } = useUnderstate({
    currentPage: appStore.currentPage,
  });

  return <div>{currentPage}</div>;
}

// ✅ Good: Separate components for different concerns
function UserInfo() {
  // Only subscribes to user-related states
  const { user, userPreferences } = useUnderstate({
    user: appStore.user,
    userPreferences: appStore.userPreferences,
  });

  return (
    <div>
      {user?.name} - Theme: {userPreferences.theme}
    </div>
  );
}

function Sidebar() {
  // Only subscribes to sidebar state
  const { sidebarOpen, toggleSidebar } = useUnderstate({
    sidebarOpen: appStore.sidebarOpen,
    toggleSidebar: appStore.toggleSidebar,
  });

  return (
    <div className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
      {/* Sidebar content */}
    </div>
  );
}

// ✅ Good: Memoized expensive computation
function ExpensiveComponent() {
  const { expensiveComputation } = useUnderstate({
    expensiveComputation: appStore.expensiveComputation,
  });

  // The derived value is memoized and only recalculates when user changes
  return <div>{expensiveComputation.result}</div>;
}
