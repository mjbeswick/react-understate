// Create the devtools panel
chrome.devtools.panels.create(
  'Understate',
  'icon.png',
  'panel.html',
  function(panel) {
    console.log('Understate devtools panel created');
  }
);
