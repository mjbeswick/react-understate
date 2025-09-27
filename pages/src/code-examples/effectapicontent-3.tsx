import { state, effect } from 'react-understate';

const isPolling = state(false, 'isPolling');
const data = state(null, 'pollingData');

effect(() => {
  if (isPolling.value) {
    console.log('Starting to poll...');

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/data');
        data.value = await response.json();
        console.log('Data updated:', data.value);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 1000);

    // Return cleanup function
    return () => {
      console.log('Stopping polling');
      clearInterval(intervalId);
    };
  }
}, 'pollingEffect');

isPolling.value = true; // Starts polling
isPolling.value = false; // Stops polling (cleanup runs)
