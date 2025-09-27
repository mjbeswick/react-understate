import { state, derived, useUnderstate } from 'react-understate';

const users = state([
  { id: 1, name: 'John', age: 25, active: true },
  { id: 2, name: 'Jane', age: 30, active: false },
  { id: 3, name: 'Bob', age: 35, active: true },
]);

const searchTerm = state('');
const showActiveOnly = state(false);

// Complex filtering and searching
const filteredUsers = derived(() => {
  let result = users.value;

  // Filter by search term
  if (searchTerm.value) {
    result = result.filter(user =>
      user.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
    );
  }

  // Filter by active status
  if (showActiveOnly.value) {
    result = result.filter(user => user.active);
  }

  return result;
});

// Statistics derived from filtered data
const userStats = derived(() => {
  const filtered = filteredUsers.value;
  return {
    total: filtered.length,
    averageAge:
      filtered.length > 0
        ? filtered.reduce((sum, user) => sum + user.age, 0) / filtered.length
        : 0,
    activeCount: filtered.filter(user => user.active).length,
  };
});

function UserList() {
  const {
    searchTerm: search,
    showActiveOnly: activeOnly,
    filteredUsers: users,
    userStats: stats,
  } = useUnderstate({
    searchTerm,
    showActiveOnly,
    filteredUsers,
    userStats,
  });

  return (
    <div>
      <h3>User Management</h3>

      <input
        type="text"
        value={search}
        onChange={e => (searchTerm.value = e.target.value)}
        placeholder="Search users..."
      />

      <label>
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={e => (showActiveOnly.value = e.target.checked)}
        />
        Show active only
      </label>

      <div>
        <p>Total: {stats.total} users</p>
        <p>Average Age: {stats.averageAge.toFixed(1)}</p>
        <p>Active: {stats.activeCount}</p>
      </div>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.age}) - {user.active ? 'Active' : 'Inactive'}
          </li>
        ))}
      </ul>
    </div>
  );
}
