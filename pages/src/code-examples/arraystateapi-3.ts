items.batch(arr => {
  arr.push('item1');
  arr.push('item2');
  arr.sort();
  // Only triggers one subscription notification
});