import { state, effect } from 'react-understate';

const userId = state(1, 'userId');
const userData = state(null, 'userData');
const userPosts = state([], 'userPosts');
const isLoading = state(false, 'isLoading');

// Effect with AbortSignal support
effect(async ({ signal }) => {
  if (!userId.value) {
    userData.value = null;
    userPosts.value = [];
    return;
  }

  isLoading.value = true;
  
  try {
    // Fetch user data with cancellation support
    const userResponse = await fetch(`/api/users/${userId.value}`, { signal });
    const user = await userResponse.json();
    userData.value = user;
    
    // Fetch user posts with cancellation support
    const postsResponse = await fetch(`/api/users/${userId.value}/posts`, { signal });
    const posts = await postsResponse.json();
    userPosts.value = posts;
    
    console.log(`Loaded data for user ${user.name}`);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request was cancelled');
    } else {
      console.error('Failed to load user data:', error);
      userData.value = null;
      userPosts.value = [];
    }
  } finally {
    isLoading.value = false;
  }
}, 'loadUserData', { preventOverlap: true });

// Rapid changes will cancel previous requests
userId.value = 2; // Cancels previous request
userId.value = 3; // Cancels previous request
userId.value = 4; // Only this request will complete