import { state, configureDebug } from 'react-understate';

// Enable debugging globally
configureDebug({ enabled: true, showFile: true });

// Create state with debug names
const userCount = state(0, 'userCount');
const activeUsers = state([], 'activeUsersList');
const appSettings = state(
  {
    theme: 'light',
    notifications: true,
  },
  'appSettings',
);

// Changes will now be logged with names:
userCount.value = 42;
// Logs: "[userCount] State changed from 0 to 42"

activeUsers.value = [{ id: 1, name: 'John' }];
// Logs: "[activeUsersList] State changed from [] to [{ id: 1, name: 'John' }]"
