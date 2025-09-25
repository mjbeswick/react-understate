// Inject page-side bridge and relay messages to background
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function () {
  this.remove();
};
document.documentElement.appendChild(script);

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window) return;
  const data = (event as MessageEvent<any>).data;
  if (data && data.source === 'understate') {
    if (data.event) chrome.runtime.sendMessage(data);
    if (data.snapshot) chrome.runtime.sendMessage(data);
  }
});
