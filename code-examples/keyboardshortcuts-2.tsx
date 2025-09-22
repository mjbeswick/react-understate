const mode = state<'normal' | 'editing' | 'selecting'>('normal', 'mode');
const selectedItems = state<string[]>([], 'selectedItems');

const setupConditionalShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const currentMode = mode.value;
    
    // Global shortcuts (work in any mode)
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          saveDocument();
          event.preventDefault();
          return;
        case 'z':
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          event.preventDefault();
          return;
      }
    }
    
    // Mode-specific shortcuts
    switch (currentMode) {
      case 'normal':
        handleNormalModeKeys(event);
        break;
      case 'editing':
        handleEditingModeKeys(event);
        break;
      case 'selecting':
        handleSelectingModeKeys(event);
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [mode], 'conditionalShortcuts');

const handleNormalModeKeys = action((event: KeyboardEvent) => {
  switch (event.key) {
    case 'n':
      createNewItem();
      event.preventDefault();
      break;
    case 'e':
      enterEditMode();
      event.preventDefault();
      break;
    case 'Delete':
      deleteSelectedItems();
      event.preventDefault();
      break;
  }
}, 'handleNormalModeKeys');