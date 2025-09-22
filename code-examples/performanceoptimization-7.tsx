const showAdvancedStats = state(false);
const userData = state({ /* large user object */ });

// Only compute expensive stats when needed
const conditionalStats = derived(() => {
  const shouldShow = showAdvancedStats.value;
  
  if (!shouldShow) {
    return { enabled: false };
  }
  
  // Only access expensive data when actually needed
  const user = userData.value;
  return {
    enabled: true,
    totalOrders: user.orders.length,
    averageOrderValue: user.orders.reduce((sum, order) => sum + order.total, 0) / user.orders.length,
    // More expensive computations...
  };
});