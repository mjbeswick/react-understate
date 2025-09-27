const connections = new Map<chrome.runtime.Port, true>();
let backlog: Array<{ type: string; payload: unknown; ts: number }> = [];

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'understate-panel') {
    connections.set(port, true);
    port.onDisconnect.addListener(() => connections.delete(port));
    port.onMessage.addListener(msg => {
      if (msg && msg.type === 'understate:request-backlog') {
        backlog.forEach(event =>
          port.postMessage({ source: 'understate', event }),
        );
      }
    });
  }
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg && msg.source === 'understate') {
    if (msg.event) {
      const event = msg.event as { type: string; payload: unknown; ts: number };
      backlog.push(event);
      if (backlog.length > 200) backlog = backlog.slice(-200);
      connections.forEach((_, port) =>
        port.postMessage({ source: 'understate', event }),
      );
    }
    if (msg.snapshot) {
      connections.forEach((_, port) =>
        port.postMessage({ source: 'understate', snapshot: msg.snapshot }),
      );
    }
  }
});
