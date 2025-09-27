const handleShortcutsWithModifiers = action((event: KeyboardEvent) => {
  const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
  const cmdOrCtrl = ctrlKey || metaKey; // Cmd on Mac, Ctrl on Windows/Linux

  // Text editing shortcuts
  if (cmdOrCtrl) {
    switch (key) {
      case 'a':
        selectAll();
        event.preventDefault();
        break;
      case 'c':
        copySelection();
        event.preventDefault();
        break;
      case 'v':
        pasteFromClipboard();
        event.preventDefault();
        break;
      case 'x':
        cutSelection();
        event.preventDefault();
        break;
      case 'z':
        if (shiftKey) {
          redo();
        } else {
          undo();
        }
        event.preventDefault();
        break;
      case 'f':
        openFindDialog();
        event.preventDefault();
        break;
      case 'n':
        if (shiftKey) {
          createNewFolder();
        } else {
          createNewFile();
        }
        event.preventDefault();
        break;
    }
  }

  // Alt/Option shortcuts
  if (altKey) {
    switch (key) {
      case 'ArrowUp':
        moveSelectionUp();
        event.preventDefault();
        break;
      case 'ArrowDown':
        moveSelectionDown();
        event.preventDefault();
        break;
    }
  }

  // Shift shortcuts (usually for selection)
  if (shiftKey && !cmdOrCtrl) {
    switch (key) {
      case 'ArrowUp':
        extendSelectionUp();
        event.preventDefault();
        break;
      case 'ArrowDown':
        extendSelectionDown();
        event.preventDefault();
        break;
    }
  }
}, 'handleShortcutsWithModifiers');
