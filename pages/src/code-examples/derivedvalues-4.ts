// ✅ DO: Keep derived functions pure
const goodDerived = derived(
  () => {
    const items = items();
    return items.filter(item => item.active).length;
  },
  { name: 'activeItemCount' },
);

// ❌ DON'T: Cause side effects in derived functions
const badDerived = derived(
  () => {
    const count = items().length;

    // Side effects! Don't do this
    localStorage.setItem('itemCount', count.toString());
    updateAnalytics('itemCountChanged', count);

    return count;
  },
  { name: 'badDerived' },
);

// ✅ DO: Use descriptive names
const userDisplayName = derived(
  () => {
    const user = currentUser();
    return user.preferredName || `${user.firstName} ${user.lastName}`;
  },
  { name: 'userDisplayName' },
);

// ✅ DO: Split complex computations into smaller pieces
const validItems = derived(
  () => {
    return items().filter(item => item.isValid);
  },
  { name: 'validItems' },
);

const sortedValidItems = derived(
  () => {
    return validItems().sort((a, b) => a.priority - b.priority);
  },
  { name: 'sortedValidItems' },
);

const displayItems = derived(
  () => {
    return sortedValidItems().slice(0, 10);
  },
  { name: 'displayItems' },
);
