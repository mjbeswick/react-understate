import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import styles from './panel.module.css';

type UnderstateEvent = { type: string; payload: unknown; ts: number };
type UnderstateSnapshot = {
  states: Record<string, unknown>;
  actions: string[];
  effects?: string[];
  ts: number;
};

function usePort() {
  const [events, setEvents] = useState([] as UnderstateEvent[]);
  const [snapshot, setSnapshot] = useState(null as UnderstateSnapshot | null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'understate-panel' });
    const onMsg = (msg: any) => {
      if (msg?.source !== 'understate') return;
      if (msg.event) {
        const ev = msg.event as UnderstateEvent;
        setEvents(prev => [ev, ...prev].slice(0, 500));
        if (ev.type === 'state:update') {
          const payload = ev.payload as { name?: string; value?: unknown };
          if (payload && typeof payload.name === 'string') {
            setSnapshot(prev =>
              prev
                ? {
                    ...prev,
                    states: { ...prev.states, [payload.name!]: payload.value },
                  }
                : prev,
            );
          }
        }
      }
      if (msg.snapshot) setSnapshot(msg.snapshot as UnderstateSnapshot);
    };
    port.onMessage.addListener(onMsg);
    port.postMessage({ type: 'understate:request-backlog' });
    setTimeout(() => {
      try {
        (window as any).__UNDERSTATE_DEVTOOLS__?.snapshot?.();
      } catch {}
    }, 50);
    return () => port.disconnect();
  }, []);

  return { events, snapshot } as const;
}

function Panel() {
  const { events, snapshot } = usePort();
  type Tab = 'states' | 'actions' | 'history';
  const [tab, setTab] = useState('states' as Tab);

  const actions = useMemo(() => snapshot?.actions ?? [], [snapshot]);
  const states = useMemo(() => snapshot?.states ?? {}, [snapshot]);
  const effects = useMemo(() => snapshot?.effects ?? [], [snapshot]);

  function refreshSnapshot() {
    const code = `(() => {\n      const u = window.reactUnderstate || {};\n      const states = u.states ? Object.fromEntries(Object.entries(u.states).map(([k, v]) => [k, v.rawValue])) : {};\n      const actions = u.actions ? Object.keys(u.actions) : [];\n      const effects = u.effects ? Object.keys(u.effects) : [];\n      return { states, actions, effects, ts: Date.now() };\n    })()`;
    try {
      chrome.devtools.inspectedWindow.eval(code, (res: any) => {
        if (res)
          (window as any).postMessage(
            { source: 'understate', snapshot: res },
            '*',
          );
      });
    } catch {}
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'states' ? styles.tabActive : ''}`}
            onClick={() => setTab('states')}
          >
            States
          </button>
          <button
            className={`${styles.tab} ${tab === 'actions' ? styles.tabActive : ''}`}
            onClick={() => setTab('actions')}
          >
            Actions
          </button>
          <button
            className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setTab('history')}
          >
            History
          </button>
          <button
            className={`${styles.tab} ${tab === 'effects' ? styles.tabActive : ''}`}
            onClick={() => setTab('effects' as Tab)}
          >
            Effects
          </button>
          <button className={styles.tab} onClick={refreshSnapshot}>
            Refresh
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {tab === 'states' && (
          <div className={styles.list}>
            {Object.keys(states).length === 0 ? (
              <div className={styles.item}>No named states detected.</div>
            ) : (
              Object.entries(states).map(([name, value]) => (
                <div className={styles.item} key={name}>
                  <div className={styles.meta}>{name}</div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'actions' && (
          <div className={styles.list}>
            {actions.length === 0 ? (
              <div className={styles.item}>No named actions detected.</div>
            ) : (
              actions.map(a => (
                <div className={styles.item} key={a}>
                  <div className={styles.meta}>{a}</div>
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'history' && (
          <div className={styles.list}>
            {events.length === 0 ? (
              <div className={styles.item}>No events yet.</div>
            ) : (
              events.map((e, i) => (
                <div className={styles.item} key={i}>
                  <div className={styles.meta}>
                    {new Date(e.ts).toLocaleTimeString()} {e.type}
                  </div>
                  <pre>{JSON.stringify(e.payload, null, 2)}</pre>
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'effects' && (
          <div className={styles.list}>
            {effects.length === 0 ? (
              <div className={styles.item}>No named effects detected.</div>
            ) : (
              effects.map(e => (
                <div className={styles.item} key={e}>
                  <div className={styles.meta}>{e}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Panel />);
