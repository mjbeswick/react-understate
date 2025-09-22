import { state, batch } from 'react-understate';

const items = state<Array<{ id: number; name: string; selected: boolean }>>([]);
const selectedCount = state(0);
const allSelected = state(false);

function toggleAllItems() {
  const shouldSelectAll = !allSelected.value;
  
  batch(() => {
    // Update all items
    items.value = items.value.map(item => ({
      ...item,
      selected: shouldSelectAll
    }));
    
    // Update derived states
    selectedCount.value = shouldSelectAll ? items.value.length : 0;
    allSelected.value = shouldSelectAll;
  });
}

function toggleItem(id: number) {
  const newItems = items.value.map(item =>
    item.id === id ? { ...item, selected: !item.selected } : item
  );
  
  const newSelectedCount = newItems.filter(item => item.selected).length;
  const newAllSelected = newSelectedCount === newItems.length;
  
  batch(() => {
    items.value = newItems;
    selectedCount.value = newSelectedCount;
    allSelected.value = newAllSelected;
  });
}

function deleteSelectedItems() {
  const remainingItems = items.value.filter(item => !item.selected);
  
  batch(() => {
    items.value = remainingItems;
    selectedCount.value = 0;
    allSelected.value = false;
  });
}