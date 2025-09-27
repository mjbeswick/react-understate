function updateItems(updates: Array<{ id: number; changes: any }>) {
  if (updates.length === 1) {
    // Single update - no need to batch
    const update = updates[0];
    const newItems = items.value.map(item =>
      item.id === update.id ? { ...item, ...update.changes } : item,
    );
    items.value = newItems;
  } else {
    // Multiple updates - use batching
    batch(() => {
      let newItems = items.value;

      updates.forEach(update => {
        newItems = newItems.map(item =>
          item.id === update.id ? { ...item, ...update.changes } : item,
        );
      });

      items.value = newItems;
      lastUpdateCount.value = updates.length;
      lastUpdateTime.value = Date.now();
    });
  }
}
