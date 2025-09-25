import { state, action, batch } from '../../dist/react-understate.esm.js';

export type UnderstateEvent = { type: string; payload: unknown; ts: number };
export type UnderstateSnapshot = { states: Record<string, unknown>; actions: string[]; ts: number };

export const eventsState = state<UnderstateEvent[]>([], 'events');
export const snapshotState = state<UnderstateSnapshot | null>(null, 'snapshot');
export const activeTabState = state<'states' | 'actions' | 'history'>('states', 'activeTab');

export const addEvent = action((event: UnderstateEvent) => {
  eventsState.value = prev => [event, ...prev].slice(0, 500);
}, 'addEvent');

export const setSnapshot = action((snap: UnderstateSnapshot) => {
  snapshotState.value = snap;
}, 'setSnapshot');

export const setActiveTab = action((tab: 'states' | 'actions' | 'history') => {
  activeTabState.value = tab;
}, 'setActiveTab');

export function setupPort() {
  const port = chrome.runtime.connect({ name: 'understate-panel' });
  const onMsg = (msg: any) => {
    if (msg?.source !== 'understate') return;
    batch(() => {
      if (msg.event) addEvent(msg.event as UnderstateEvent);
      if (msg.snapshot) setSnapshot(msg.snapshot as UnderstateSnapshot);
    });
  };
  port.onMessage.addListener(onMsg);
  port.postMessage({ type: 'understate:request-backlog' });
  setTimeout(() => { try { (window as any).__UNDERSTATE_DEVTOOLS__?.snapshot?.(); } catch {} }, 50);
  return () => port.disconnect();
}


