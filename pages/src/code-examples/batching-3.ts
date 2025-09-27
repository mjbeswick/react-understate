// 1. Bulk data loading
export const loadBulkData = action(
  async (data: BulkData) => {
    console.log('action: loading bulk data');

    // Without batching - multiple re-renders
    // users(data.users);
    // posts(data.posts);
    // comments(data.comments);
    // settings(data.settings);

    // With batching - single re-render
    batch(() => {
      users(data.users);
      posts(data.posts);
      comments(data.comments);
      settings(data.settings);
    });
  },
  { name: 'loadBulkData' },
);

// 2. Form validation updates
export const validateForm = action(
  (formData: FormData) => {
    console.log('action: validating form');

    const errors = validateFormData(formData);

    batch(() => {
      // Update all validation states at once
      formErrors(errors);
      fieldErrors(errors.fieldErrors);
      isValid(Object.keys(errors).length === 0);
      isDirty(true);
    });
  },
  { name: 'validateForm' },
);

// 3. UI state synchronization
export const syncUIState = action(
  (uiState: UIState) => {
    console.log('action: syncing UI state');

    batch(() => {
      // Update all UI-related state together
      sidebarOpen(uiState.sidebarOpen);
      modalVisible(uiState.modalVisible);
      activeTab(uiState.activeTab);
      theme(uiState.theme);
      language(uiState.language);
    });
  },
  { name: 'syncUIState' },
);

// 4. Optimized list operations
export const updateListItems = action(
  (updates: ItemUpdate[]) => {
    console.log('action: updating list items');

    batch(() => {
      updates.forEach(update => {
        items(prev =>
          prev.map(item =>
            item.id === update.id ? { ...item, ...update.changes } : item,
          ),
        );
      });

      // Update derived state after all item updates
      totalCount(items().length);
      selectedCount(items().filter(item => item.selected).length);
    });
  },
  { name: 'updateListItems' },
);

// 5. Animation state updates
export const startAnimation = action(
  () => {
    console.log('action: starting animation');

    batch(() => {
      isAnimating(true);
      animationProgress(0);
      animationDuration(1000);
      animationEasing('ease-in-out');
    });

    // Animation loop outside of batch
    animate();
  },
  { name: 'startAnimation' },
);
