// Create the devtools panel
chrome.devtools.panels.create(
  'Understate',
  '',
  'dist/panel.html',
  function (_panel) {
    console.log('Understate devtools panel created');
  },
);
