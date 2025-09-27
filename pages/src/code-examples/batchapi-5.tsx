import { state, batch } from 'react-understate';

const currentView = state('home');
const isLoading = state(false);
const data = state(null);
const error = state(null);

// ✅ Batch state transition updates
function navigateToProfile(userId: string) {
  batch(() => {
    currentView.value = 'profile';
    isLoading.value = true;
    error.value = null;
    data.value = null; // Clear previous data
  });

  // Then load new data
  loadProfileData(userId);
}

function handleDataLoad(result: any) {
  batch(() => {
    data.value = result;
    isLoading.value = false;
    error.value = null;
  });
}

function handleError(err: Error) {
  batch(() => {
    data.value = null;
    isLoading.value = false;
    error.value = err.message;
  });
}
