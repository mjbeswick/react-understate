const setupFocusAwareShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't handle shortcuts if user is typing in an input
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    // Only handle shortcuts when the main app area is focused
    if (!target.closest('.app-main')) {
      return;
    }
    
    // Now handle the shortcuts
    switch (event.key) {
      case 'j':
        selectNext();
        event.preventDefault();
        break;
      case 'k':
        selectPrevious();
        event.preventDefault();
        break;
      case 'Enter':
        openSelected();
        event.preventDefault();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, 'focusAwareShortcuts');