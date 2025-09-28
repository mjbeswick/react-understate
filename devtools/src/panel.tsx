import { useState, useEffect } from 'react';
import styles from './panel.module.css';

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

type Snapshot = {
  states: Record<string, JsonValue>;
  actions: Record<string, unknown>;
  effects: Record<string, unknown>;
  error?: string;
};

type Tab = 'states' | 'actions' | 'effects' | 'history';

function JsonViewer({
  data,
  level = 0,
  disableExpansion = false,
}: {
  data: JsonValue;
  level?: number;
  disableExpansion?: boolean;
}) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const isExpanded = disableExpansion ? true : expanded;
  const isObject =
    typeof data === 'object' && data !== null && !Array.isArray(data);
  const isArray = Array.isArray(data);

  if (data === null) {
    return <span className={styles.jsonNull}>null</span>;
  }

  if (typeof data === 'string') {
    return <span className={styles.jsonString}>"{data}"</span>;
  }

  if (typeof data === 'number') {
    return <span className={styles.jsonNumber}>{data}</span>;
  }

  if (typeof data === 'boolean') {
    return <span className={styles.jsonBoolean}>{data.toString()}</span>;
  }

  if (isArray) {
    const array = data as JsonArray;
    if (!isExpanded) {
      return (
        <span className={styles.jsonContainer}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <span className={styles.jsonBracket}>[</span>
          <span className={styles.jsonCount}>{array.length}</span>
          <span className={styles.jsonBracket}>]</span>
        </span>
      );
    }

    return (
      <div>
        <div className={styles.jsonContainer}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <span className={styles.jsonBracket}>[</span>
        </div>
        <div
          className={styles.jsonIndent}
          style={{ marginLeft: `${level * 8 + 12}px` }}
        >
          {array.map((item, index) => (
            <div key={index} className={styles.jsonItem}>
              <span className={styles.jsonKey}>{index}</span>
              <span className={styles.jsonColon}>:</span>
              <JsonViewer data={item} level={level + 1} />
            </div>
          ))}
        </div>
        <div className={styles.jsonContainer}>
          <span className={styles.jsonBracket}>]</span>
        </div>
      </div>
    );
  }

  if (isObject) {
    const obj = data as JsonObject;
    const keys = Object.keys(obj);

    if (!isExpanded) {
      return (
        <span className={styles.jsonContainer}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <span className={styles.jsonBrace}>{'{'}</span>
          <span className={styles.jsonCount}>{keys.length}</span>
          <span className={styles.jsonBrace}>{'}'}</span>
        </span>
      );
    }

    return (
      <span>
        <span className={styles.jsonContainer}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'}
          </button>
          <span className={styles.jsonBrace}>{'{'}</span>
        </span>
        <div
          className={styles.jsonIndent}
          style={{ marginLeft: `${level * 8 + 12}px` }}
        >
          {keys.map(key => (
            <div key={key} className={styles.jsonItem}>
              <span className={styles.jsonKey}>{key}</span>
              <span className={styles.jsonColon}>:</span>
              <JsonViewer data={obj[key]} level={level + 1} />
            </div>
          ))}
        </div>
        <div className={styles.jsonContainer}>
          <span className={styles.jsonBrace}>{'}'}</span>
        </div>
      </span>
    );
  }

  return <span>{String(data)}</span>;
}

function StateItem({ name, value }: { name: string; value: JsonValue }) {
  const [expanded, setExpanded] = useState(false);

  const renderInlineValue = (val: JsonValue): JSX.Element => {
    if (val === null) return <span className={styles.jsonNull}>null</span>;
    if (typeof val === 'string')
      return <span className={styles.jsonString}>"{val}"</span>;
    if (typeof val === 'number')
      return <span className={styles.jsonNumber}>{val}</span>;
    if (typeof val === 'boolean')
      return <span className={styles.jsonBoolean}>{String(val)}</span>;
    if (Array.isArray(val))
      return <span className={styles.jsonCount}>Array({val.length})</span>;
    if (typeof val === 'object')
      return <span className={styles.jsonCount}>Object</span>;
    return <span>{String(val)}</span>;
  };

  const isExpandable = (val: JsonValue): boolean => {
    return (typeof val === 'object' && val !== null) || Array.isArray(val);
  };

  return (
    <div className={styles.stateItem}>
      <div
        className={styles.stateHeader}
        onClick={() => {
          if (isExpandable(value)) {
            setExpanded(!expanded);
          }
        }}
      >
        {isExpandable(value) && (
          <span className={styles.expandBtn}>{expanded ? '▼' : '▶'}</span>
        )}
        {!isExpandable(value) && <span style={{ width: '8px' }}></span>}
        <span className={styles.stateName}>{name}:</span>
        {renderInlineValue(value)}
      </div>
      {expanded && isExpandable(value) && (
        <div className={styles.stateContent}>
          <JsonViewer data={value} level={1} />
        </div>
      )}
    </div>
  );
}

type HistoryEntry = {
  timestamp: number;
  stateName: string;
  oldValue: JsonValue;
  newValue: JsonValue;
};

function Panel() {
  const [currentTab, setCurrentTab] = useState<Tab>('states');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Auto-detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkTheme(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const refreshSnapshot = () => {
    console.log('Refreshing snapshot...');

    chrome.devtools.inspectedWindow.eval(
      `
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
    `,
      (result, isException) => {
        if (isException) {
          console.error('Error getting snapshot:', result);
          setSnapshot({
            states: {},
            actions: {},
            effects: {},
            error: String(result),
          });
        } else {
          console.log('Snapshot result:', result);

          // Track history of state changes
          if (snapshot && result.states) {
            const newHistory: HistoryEntry[] = [];
            Object.entries(result.states).forEach(([name, newValue]) => {
              const oldValue = snapshot.states[name];
              if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                newHistory.push({
                  timestamp: Date.now(),
                  stateName: name,
                  oldValue,
                  newValue,
                });
              }
            });
            if (newHistory.length > 0) {
              setHistory(prev => [...newHistory, ...prev].slice(0, 100)); // Keep last 100 entries
            }
          }

          setSnapshot(result as Snapshot);
        }
      },
    );
  };

  const setupSubscriptions = () => {
    console.log('Setting up state subscriptions...');

    chrome.devtools.inspectedWindow.eval(
      `
      (function() {
        const u = window.reactUnderstate;
        if (!u || !u.states) {
          return { success: false, error: 'No states found' };
        }
        
        // Clear existing subscriptions
        if (window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__) {
          window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__.forEach(unsub => unsub());
        }
        window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__ = [];
        
        // Store previous values for comparison
        window.__UNDERSTATE_DEVTOOLS_PREVIOUS_VALUES__ = {};
        Object.entries(u.states).forEach(([name, state]) => {
          try {
            window.__UNDERSTATE_DEVTOOLS_PREVIOUS_VALUES__[name] = 
              state.rawValue !== undefined ? state.rawValue : state.value;
          } catch (e) {
            window.__UNDERSTATE_DEVTOOLS_PREVIOUS_VALUES__[name] = null;
          }
        });
        
        // Subscribe to all states
        Object.entries(u.states).forEach(([name, state]) => {
          if (state && typeof state.subscribe === 'function') {
            const unsubscribe = state.subscribe(() => {
              console.log('State changed:', name);
              // Update the flag that devtools can check
              window.__UNDERSTATE_DEVTOOLS_STATE_CHANGED__ = true;
              window.__UNDERSTATE_DEVTOOLS_LAST_CHANGED__ = name;
            });
            window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__.push(unsubscribe);
          }
        });
        
        return { 
          success: true, 
          subscribedCount: window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__.length 
        };
      })()
    `,
      (result, isException) => {
        if (isException) {
          console.error('Error setting up subscriptions:', result);
        } else {
          console.log('Subscription result:', result);
          if (result.success) {
            console.log(`Subscribed to ${result.subscribedCount} states`);
          }
        }
      },
    );
  };

  const cleanupSubscriptions = () => {
    chrome.devtools.inspectedWindow.eval(
      `
      (function() {
        if (window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__) {
          window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__.forEach(unsub => unsub());
          window.__UNDERSTATE_DEVTOOLS_SUBSCRIPTIONS__ = [];
        }
        return { success: true };
      })()
    `,
      (_result, isException) => {
        if (!isException) {
          console.log('Subscriptions cleaned up');
        }
      },
    );
  };

  useEffect(() => {
    refreshSnapshot();
    setupSubscriptions();

    // Poll for state changes
    const pollInterval = setInterval(() => {
      chrome.devtools.inspectedWindow.eval(
        `
        (function() {
          if (window.__UNDERSTATE_DEVTOOLS_STATE_CHANGED__) {
            window.__UNDERSTATE_DEVTOOLS_STATE_CHANGED__ = false;
            return { changed: true, lastChanged: window.__UNDERSTATE_DEVTOOLS_LAST_CHANGED__ };
          }
          return { changed: false };
        })()
      `,
        (result, isException) => {
          if (!isException && result.changed) {
            console.log('State change detected:', result.lastChanged);
            refreshSnapshot();
          }
        },
      );
    }, 100); // Poll every 100ms

    return () => {
      clearInterval(pollInterval);
      cleanupSubscriptions();
    };
  }, []);

  const renderStatesContent = () => {
    if (snapshot?.error) {
      return <div className={styles.errorState}>{snapshot.error}</div>;
    }

    const states = snapshot?.states || {};
    const stateEntries = Object.entries(states);

    if (stateEntries.length === 0) {
      return <div className={styles.emptyState}>No named states detected.</div>;
    }

    return stateEntries.map(([name, value]) => (
      <StateItem key={name} name={name} value={value} />
    ));
  };

  const renderActionsContent = () => {
    const actions = snapshot?.actions || {};
    const actionEntries = Object.entries(actions);

    if (actionEntries.length === 0) {
      return (
        <div className={styles.emptyState}>No named actions detected.</div>
      );
    }

    return actionEntries.map(([name, action]) => (
      <div key={name} className={styles.stateItem}>
        <div className={styles.stateHeader}>
          <span className={styles.stateName}>{name}</span>
          <span className={styles.stateType}>({typeof action})</span>
        </div>
      </div>
    ));
  };

  const renderEffectsContent = () => {
    const effects = snapshot?.effects || {};
    const effectEntries = Object.entries(effects);

    if (effectEntries.length === 0) {
      return (
        <div className={styles.emptyState}>No named effects detected.</div>
      );
    }

    return effectEntries.map(([name, _effect]) => (
      <div key={name} className={styles.stateItem}>
        <div className={styles.stateHeader}>
          <span className={styles.stateName}>{name}</span>
          <span className={styles.stateType}>(effect)</span>
        </div>
      </div>
    ));
  };

  const renderHistoryContent = () => {
    if (history.length === 0) {
      return (
        <div className={styles.emptyState}>No state changes recorded.</div>
      );
    }

    return history.map((entry, index) => (
      <div key={index} className={styles.stateItem}>
        <div className={styles.stateHeader}>
          <span className={styles.stateName}>{entry.stateName}</span>
          <span className={styles.stateType}>
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className={styles.stateContent}>
          <div style={{ marginBottom: '4px' }}>
            <span className={styles.jsonKey}>from:</span>
            <JsonViewer data={entry.oldValue} />
          </div>
          <div>
            <span className={styles.jsonKey}>to:</span>
            <JsonViewer data={entry.newValue} />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className={`${styles.container} ${isDarkTheme ? styles.dark : ''}`}>
      <div className={styles.toolbar}>
        <div
          className={`${styles.tab} ${currentTab === 'states' ? styles.active : ''}`}
          onClick={() => setCurrentTab('states')}
        >
          States
        </div>
        <div
          className={`${styles.tab} ${currentTab === 'actions' ? styles.active : ''}`}
          onClick={() => setCurrentTab('actions')}
        >
          Actions
        </div>
        <div
          className={`${styles.tab} ${currentTab === 'effects' ? styles.active : ''}`}
          onClick={() => setCurrentTab('effects')}
        >
          Effects
        </div>
        <div
          className={`${styles.tab} ${currentTab === 'history' ? styles.active : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          History
        </div>
        <div
          className={styles.tab}
          onClick={toggleTheme}
          style={{ marginLeft: 'auto' }}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </div>
      </div>

      <div className={styles.content}>
        {currentTab === 'states' && renderStatesContent()}
        {currentTab === 'actions' && renderActionsContent()}
        {currentTab === 'effects' && renderEffectsContent()}
        {currentTab === 'history' && renderHistoryContent()}
      </div>
    </div>
  );
}

export default Panel;
