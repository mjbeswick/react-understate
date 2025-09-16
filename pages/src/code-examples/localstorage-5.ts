// State with mixed persistence needs
export const editorState = state({
  // Persistent data
  settings: {
    fontSize: 14,
    theme: 'vs-dark',
    wordWrap: true,
  },
  recentFiles: [] as string[],
  
  // Session-only data (not persisted)
  currentFile: null as string | null,
  isLoading: false,
  errors: [] as string[],
}, { name: 'editorState' });

// Derived state for persistent parts only
export const persistentEditorData = derived(() => {
  const state = editorState();
  return {
    settings: state.settings,
    recentFiles: state.recentFiles,
  };
}, { name: 'persistentEditorData' });

// Effect to save only persistent data
export const saveEditorDataEffect = effect(() => {
  const persistentData = persistentEditorData();
  
  try {
    localStorage.setItem('editor-data', JSON.stringify(persistentData));
  } catch (error) {
    console.error('effect: failed to save editor data', error);
  }
}, { name: 'saveEditorDataEffect' });

// Action to load persistent data
export const loadEditorData = action(() => {
  console.log('action: loading editor data');
  
  try {
    const saved = localStorage.getItem('editor-data');
    if (saved) {
      const persistentData = JSON.parse(saved);
      
      editorState(prev => ({
        ...prev,
        settings: persistentData.settings || prev.settings,
        recentFiles: persistentData.recentFiles || prev.recentFiles,
        // Keep session data unchanged
      }));
    }
  } catch (error) {
    console.error('action: failed to load editor data', error);
  }
}, { name: 'loadEditorData' });

// Custom persistence for complex scenarios
export const createSelectivePersistence = <T, K extends keyof T>(
  stateInstance: any,
  storageKey: string,
  persistentKeys: K[]
) => {
  // Save effect
  const saveEffect = effect(() => {
    const fullState = stateInstance();
    const persistentData = persistentKeys.reduce((acc, key) => {
      acc[key] = fullState[key];
      return acc;
    }, {} as Pick<T, K>);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(persistentData));
    } catch (error) {
      console.error(\`Failed to persist \${storageKey}\`, error);
    }
  }, { name: \`save-\${storageKey}\` });
  
  // Load action
  const loadAction = action(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const persistentData = JSON.parse(saved);
        stateInstance((prev: T) => ({ ...prev, ...persistentData }));
      }
    } catch (error) {
      console.error(\`Failed to load \${storageKey}\`, error);
    }
  }, { name: \`load-\${storageKey}\` });
  
  return { saveEffect, loadAction };
};

// Usage
const { saveEffect: saveUIEffect, loadAction: loadUIData } = 
  createSelectivePersistence(
    editorState,
    'ui-settings',
    ['settings', 'recentFiles'] // Only these keys will be persisted
  );