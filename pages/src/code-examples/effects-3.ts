// 1. API synchronization
const userId = state<number | null>(null, { name: 'userId' });
const userData = state<any>(null, { name: 'userData' });
const loading = state(false, { name: 'loading' });
const error = state<string | null>(null, { name: 'error' });

export const userSyncEffect = effect(() => {
  const id = userId();
  
  if (!id) {
    userData(null);
    return;
  }
  
  loading(true);
  error(null);
  
  let cancelled = false;
  
  fetchUser(id)
    .then(data => {
      if (!cancelled) {
        userData(data);
        loading(false);
      }
    })
    .catch(err => {
      if (!cancelled) {
        error(err.message);
        loading(false);
      }
    });
  
  return () => {
    cancelled = true;
  };
}, { name: 'userSyncEffect' });

// 2. Local storage persistence
const settings = state({
  theme: 'light',
  language: 'en',
  notifications: true,
}, { name: 'settings' });

export const settingsPersistenceEffect = effect(() => {
  const currentSettings = settings();
  
  try {
    localStorage.setItem('app-settings', JSON.stringify(currentSettings));
  } catch (error) {
    console.error('effect: failed to save settings', error);
  }
}, { name: 'settingsPersistenceEffect' });

// Load settings on initialization
export const loadSettingsEffect = effect(() => {
  try {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      settings(parsed);
    }
  } catch (error) {
    console.error('effect: failed to load settings', error);
  }
}, { name: 'loadSettingsEffect' });

// 3. Document title updates
const pageTitle = state('Home', { name: 'pageTitle' });
const unreadCount = state(0, { name: 'unreadCount' });

export const documentTitleEffect = effect(() => {
  const title = pageTitle();
  const unread = unreadCount();
  
  const fullTitle = unread > 0 ? `(${unread}) ${title}` : title;
  document.title = `${fullTitle} - My App`;
}, { name: 'documentTitleEffect' });

// 4. Analytics tracking
const currentPage = state('/', { name: 'currentPage' });
const user = state(null, { name: 'user' });

export const analyticsEffect = effect(() => {
  const page = currentPage();
  const userData = user();
  
  // Track page views
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
  
  // Track user events
  if (userData) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'user_login', {
        user_id: userData.id,
      });
    }
  }
}, { name: 'analyticsEffect' });

// 5. WebSocket connections
const isConnected = state(false, { name: 'isConnected' });
const messages = state<any[]>([], { name: 'messages' });

export const websocketEffect = effect(() => {
  const connected = isConnected();
  
  if (!connected) return;
  
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onopen = () => {
    console.log('effect: websocket connected');
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    messages(prev => [...prev, message]);
  };
  
  ws.onclose = () => {
    console.log('effect: websocket disconnected');
    isConnected(false);
  };
  
  ws.onerror = (error) => {
    console.error('effect: websocket error', error);
    isConnected(false);
  };
  
  return () => {
    console.log('effect: closing websocket');
    ws.close();
  };
}, { name: 'websocketEffect' });