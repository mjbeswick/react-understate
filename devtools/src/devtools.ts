// Guard against duplicate panel creation (Chrome can init devtools_page twice)
const FLAG = '__UNDERSTATE_DEVTOOLS_PANEL_CREATED__';
if (!(globalThis as any)[FLAG]) {
  (globalThis as any)[FLAG] = true;
  chrome.devtools.panels.create('Understate', '', 'panel.html', function () {});
}
