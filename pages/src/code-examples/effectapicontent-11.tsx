import { state, effect } from 'react-understate';

const isConnected = state(false, 'isConnected');
const room = state('general', 'room');
const messages = state([], 'messages');
const connectionStatus = state('disconnected', 'connectionStatus');

let websocket: WebSocket | null = null;

// WebSocket connection management
effect(() => {
  if (isConnected.value && room.value) {
    connectionStatus.value = 'connecting';

    const ws = new WebSocket(`ws://localhost:8080/rooms/${room.value}`);
    websocket = ws;

    ws.onopen = () => {
      connectionStatus.value = 'connected';
      console.log(`Connected to room: ${room.value}`);
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      messages.value = [...messages.value, message];
    };

    ws.onclose = () => {
      connectionStatus.value = 'disconnected';
      console.log('WebSocket connection closed');
    };

    ws.onerror = error => {
      connectionStatus.value = 'error';
      console.error('WebSocket error:', error);
    };

    // Cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      websocket = null;
    };
  } else {
    connectionStatus.value = 'disconnected';
    messages.value = [];
  }
}, 'manageWebSocket');

// Usage
isConnected.value = true; // Connects to WebSocket
room.value = 'developers'; // Switches to different room (reconnects)
isConnected.value = false; // Disconnects and cleans up
