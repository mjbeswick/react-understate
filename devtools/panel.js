// Panel script for Understate DevTools
console.log('Understate panel loaded');

let currentTab = 'states';
let snapshot = null;

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  if (tab.dataset.tab) {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      updateTabs();
      updateContent();
    });
  }
});

function updateTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${currentTab}"]`).classList.add('active');
}

function updateContent() {
  document.querySelectorAll('[id$="-content"]').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(`${currentTab}-content`).style.display = 'block';
}

// Snapshot refresh function
function refreshSnapshot() {
  console.log('Refreshing snapshot...');
  
  // Execute code in the page context to get states
  chrome.devtools.inspectedWindow.eval(`
    (function() {
      console.log('Scanning for reactUnderstate...');
      const u = window.reactUnderstate;
      console.log('Found reactUnderstate:', u);
      
      if (!u) {
        return { states: {}, actions: {}, effects: {}, error: 'reactUnderstate not found' };
      }
      
      const states = {};
      const actions = {};
      const effects = {};
      
      // Extract states
      if (u.states) {
        Object.entries(u.states).forEach(([name, state]) => {
          try {
            states[name] = state.rawValue !== undefined ? state.rawValue : state.value;
          } catch (e) {
            states[name] = 'Error reading state: ' + e.message;
          }
        });
      }
      
      // Extract actions
      if (u.actions) {
        Object.entries(u.actions).forEach(([name, action]) => {
          actions[name] = typeof action === 'function' ? 'Function' : action;
        });
      }
      
      // Extract effects
      if (u.effects) {
        Object.entries(u.effects).forEach(([name, effect]) => {
          effects[name] = effect;
        });
      }
      
      console.log('Snapshot data:', { states, actions, effects });
      return { states, actions, effects };
    })()
  `, (result, isException) => {
    if (isException) {
      console.error('Error getting snapshot:', result);
      updateStatesContent([], 'Error: ' + result);
    } else {
      console.log('Snapshot result:', result);
      snapshot = result;
      updateStatesContent(result.states || {});
      updateActionsContent(result.actions || {});
      updateEffectsContent(result.effects || {});
    }
  });
}

// Update states content
function updateStatesContent(states, error = null) {
  const container = document.getElementById('states-content');
  
  if (error) {
    container.innerHTML = `<div class="empty-state">${error}</div>`;
    return;
  }
  
  const stateEntries = Object.entries(states);
  
  if (stateEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">No named states detected.</div>';
    return;
  }
  
  container.innerHTML = stateEntries.map(([name, value]) => {
    const type = getValueType(value);
    return `
      <div class="state-item">
        <div class="state-header" onclick="toggleState(this)">
          <button class="expand-btn">▶</button>
          <span class="state-name">${name}</span>
          <span class="state-type">(${type})</span>
        </div>
        <div class="state-content">
          <pre>${formatValue(value)}</pre>
        </div>
      </div>
    `;
  }).join('');
}

// Update actions content
function updateActionsContent(actions) {
  const container = document.getElementById('actions-content');
  const actionEntries = Object.entries(actions);
  
  if (actionEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">No named actions detected.</div>';
    return;
  }
  
  container.innerHTML = actionEntries.map(([name, action]) => `
    <div class="state-item">
      <div class="state-header">
        <span class="state-name">${name}</span>
        <span class="state-type">(${typeof action})</span>
      </div>
    </div>
  `).join('');
}

// Update effects content
function updateEffectsContent(effects) {
  const container = document.getElementById('effects-content');
  const effectEntries = Object.entries(effects);
  
  if (effectEntries.length === 0) {
    container.innerHTML = '<div class="empty-state">No named effects detected.</div>';
    return;
  }
  
  container.innerHTML = effectEntries.map(([name, effect]) => `
    <div class="state-item">
      <div class="state-header">
        <span class="state-name">${name}</span>
        <span class="state-type">(effect)</span>
      </div>
    </div>
  `).join('');
}

// Toggle state expansion
function toggleState(header) {
  const content = header.nextElementSibling;
  const btn = header.querySelector('.expand-btn');
  
  if (content.classList.contains('expanded')) {
    content.classList.remove('expanded');
    btn.textContent = '▶';
  } else {
    content.classList.add('expanded');
    btn.textContent = '▼';
  }
}

// Helper functions
function getValueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function formatValue(value) {
  if (value === null) return '<span class="json-null">null</span>';
  if (typeof value === 'string') return `<span class="json-string">"${value}"</span>`;
  if (typeof value === 'number') return `<span class="json-number">${value}</span>`;
  if (typeof value === 'boolean') return `<span class="json-boolean">${value}</span>`;
  
  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

// Auto-refresh on load
refreshSnapshot();

// Make refreshSnapshot available globally
window.refreshSnapshot = refreshSnapshot;
