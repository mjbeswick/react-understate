// 1. Minimize dependencies by splitting computations
// ❌ Inefficient: Recomputes everything when any user property changes
const inefficientUserDisplay = derived(
  () => {
    const user = fullUserObject(); // Large object with many properties
    return `${user.firstName} ${user.lastName} (${user.email})`;
  },
  { name: 'inefficientUserDisplay' },
);

// ✅ Efficient: Only depends on specific properties
const efficientUserDisplay = derived(
  () => {
    const first = firstName();
    const last = lastName();
    const email = userEmail();
    return `${first} ${last} (${email})`;
  },
  { name: 'efficientUserDisplay' },
);

// 2. Use intermediate derived values for complex chains
const userOrders = state<Order[]>([], { name: 'userOrders' });

// Break down complex computation into steps
export const validOrders = derived(
  () => {
    return userOrders().filter(order => order.status !== 'cancelled');
  },
  { name: 'validOrders' },
);

export const ordersByMonth = derived(
  () => {
    const valid = validOrders();

    return valid.reduce(
      (acc, order) => {
        const month = order.date.getMonth();
        if (!acc[month]) acc[month] = [];
        acc[month].push(order);
        return acc;
      },
      {} as Record<number, Order[]>,
    );
  },
  { name: 'ordersByMonth' },
);

export const monthlyRevenue = derived(
  () => {
    const byMonth = ordersByMonth();

    return Object.entries(byMonth).map(([month, orders]) => ({
      month: parseInt(month),
      revenue: orders.reduce((sum, order) => sum + order.total, 0),
      orderCount: orders.length,
    }));
  },
  { name: 'monthlyRevenue' },
);

// 3. Conditional dependencies for better performance
const showAdvancedStats = state(false, { name: 'showAdvancedStats' });

export const conditionalStats = derived(
  () => {
    const shouldShow = showAdvancedStats();

    if (!shouldShow) {
      // Don't access expensive data when not needed
      return { enabled: false };
    }

    // Only compute when actually needed
    const stats = todoStats();
    const revenue = monthlyRevenue();

    return {
      enabled: true,
      ...stats,
      revenue,
      // More expensive computations...
    };
  },
  { name: 'conditionalStats' },
);
