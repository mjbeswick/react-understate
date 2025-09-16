// ✅ DO: Subscribe only to what you need
function GoodComponent() {
  const { user } = useUnderstate({ user: appStore.user });
  return <div>{user?.name}</div>;
}

// ❌ DON'T: Subscribe to entire large stores
function BadComponent() {
  const everything = useUnderstate(appStore); // Re-renders on any change
  return <div>{everything.user?.name}</div>;
}

// ✅ DO: Use custom hooks for reusable logic
function useAuth() {
  return useUnderstate({
    user: authStore.user,
    login: authStore.login,
    logout: authStore.logout
  });
}

// ✅ DO: Actions are stable - safe in dependency arrays
function GoodEffect() {
  const { loadData } = useUnderstate({ loadData: dataStore.loadData });
  
  useEffect(() => {
    loadData();
  }, [loadData]); // Safe - loadData reference is stable
}

// ❌ DON'T: Mutate state values directly
function BadMutation() {
  const { user } = useUnderstate({ user: userStore.user });
  
  const handleUpdate = () => {
    user.name = 'New Name'; // ❌ Direct mutation
    userStore.user.value = user; // ❌ Won't trigger updates
  };
}

// ✅ DO: Create new objects for updates
function GoodMutation() {
  const { user, updateUser } = useUnderstate({
    user: userStore.user,
    updateUser: userStore.updateUser
  });
  
  const handleUpdate = () => {
    updateUser({ ...user, name: 'New Name' }); // ✅ Proper update
  };
}