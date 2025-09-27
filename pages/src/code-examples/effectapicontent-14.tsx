import { state, effect } from 'react-understate';

const dataId = state(1, 'dataId');
const data = state(null, 'data');
const error = state(null, 'error');
const isLoading = state(false, 'isLoading');

effect(
  async ({ signal }) => {
    if (!dataId.value) {
      data.value = null;
      error.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`/api/data/${dataId.value}`, { signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      data.value = result;
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      error.value = errorMessage;
      data.value = null;

      console.error(`Failed to load data for ID ${dataId.value}:`, err);
    } finally {
      isLoading.value = false;
    }
  },
  'loadData',
  { preventOverlap: true },
);
