import { state, batch } from 'react-understate';

const user = state({ name: '', age: 0 });
const userStats = state({ loginCount: 0, lastLogin: null });
const userPrefs = state({ theme: 'light', lang: 'en' });

// ✅ Good - batch related user updates
function loadUserProfile(userData: any) {
  batch(() => {
    user.value = { name: userData.name, age: userData.age };
    userStats.value = { 
      loginCount: userData.loginCount, 
      lastLogin: userData.lastLogin 
    };
    userPrefs.value = { 
      theme: userData.preferences.theme,
      lang: userData.preferences.language
    };
  });
}

// ❌ Less ideal - separate updates cause multiple renders
function loadUserProfileUnbatched(userData: any) {
  user.value = { name: userData.name, age: userData.age };
  userStats.value = { loginCount: userData.loginCount, lastLogin: userData.lastLogin };
  userPrefs.value = { theme: userData.preferences.theme, lang: userData.preferences.language };
}