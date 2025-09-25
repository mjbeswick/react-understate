(function () {
  const DEVTOOLS_GLOBAL = '__UNDERSTATE_DEVTOOLS__';
  function ensureBridge() {
    try {
      if ((window as any)[DEVTOOLS_GLOBAL])
        return (window as any)[DEVTOOLS_GLOBAL];
      const bridge = {
        publish(event: any) {
          try {
            window.postMessage({ source: 'understate', event }, '*');
          } catch (_) {}
        },
        snapshot() {
          try {
            const u = (window as any).reactUnderstate;
            const states = u?.states
              ? Object.fromEntries(
                  Object.entries(u.states).map(([k, v]: any) => [
                    k,
                    (v as any).rawValue,
                  ]),
                )
              : {};
            const actions = u?.actions ? Object.keys(u.actions) : [];
            const effects = u?.effects ? Object.keys(u.effects) : [];
            window.postMessage(
              {
                source: 'understate',
                snapshot: { states, actions, effects, ts: Date.now() },
              },
              '*',
            );
          } catch (_) {}
        },
      } as const;
      Object.defineProperty(window as any, DEVTOOLS_GLOBAL, {
        value: bridge,
        configurable: false,
        enumerable: false,
        writable: false,
      });
      return bridge;
    } catch (_) {
      /* ignore */
    }
  }
  ensureBridge();
})();
