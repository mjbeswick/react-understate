const orders = state([]);

// Break down complex computation into steps
const validOrders = derived(() => {
  return orders.value.filter(order => order.status !== 'cancelled');
});

const ordersByMonth = derived(() => {
  const valid = validOrders.value;

  return valid.reduce(
    (acc, order) => {
      const month = order.date.getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(order);
      return acc;
    },
    {} as Record<number, Order[]>,
  );
});

const monthlyRevenue = derived(() => {
  const byMonth = ordersByMonth.value;

  return Object.entries(byMonth).map(([month, orders]) => ({
    month: parseInt(month),
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    orderCount: orders.length,
  }));
});
