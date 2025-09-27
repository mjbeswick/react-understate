import { state, effect, derived } from 'react-understate';

const currentPage = state('Home', 'currentPage');
const unreadNotifications = state(0, 'unreadNotifications');
const userName = state('', 'userName');

// Derived title that combines multiple states
const documentTitle = derived(() => {
  const page = currentPage.value;
  const unread = unreadNotifications.value;
  const user = userName.value;

  let title = page;

  if (unread > 0) {
    title = `(${unread}) ${title}`;
  }

  if (user) {
    title += ` - ${user}`;
  }

  return title;
}, 'documentTitle');

// Effect to update document title
effect(() => {
  document.title = documentTitle.value;
  console.log(`Document title updated: ${documentTitle.value}`);
}, 'updateDocumentTitle');

// Usage
currentPage.value = 'Dashboard'; // Title: "Dashboard"
unreadNotifications.value = 3; // Title: "(3) Dashboard"
userName.value = 'John Doe'; // Title: "(3) Dashboard - John Doe"
