// Multiple dependencies
const user = state({ id: 1, name: 'John' }, { name: 'user' });
const theme = state('light', { name: 'theme' });
const language = state('en', { name: 'language' });

// Effect depends on all three
export const userPreferencesEffect = effect(() => {
  const userData = user();
  const currentTheme = theme();
  const currentLanguage = language();
  
  console.log('effect: user preferences changed', {
    user: userData.name,
    theme: currentTheme,
    language: currentLanguage,
  });
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Set language
  document.documentElement.lang = currentLanguage;
}, { name: 'userPreferencesEffect' });

// Conditional dependencies
const showAdvancedFeatures = state(false, { name: 'showAdvancedFeatures' });
const advancedData = state(null, { name: 'advancedData' });

export const conditionalEffect = effect(() => {
  const showAdvanced = showAdvancedFeatures();
  
  if (showAdvanced) {
    // Only depends on advancedData when showAdvanced is true
    const data = advancedData();
    console.log('effect: processing advanced data', data);
  } else {
    console.log('effect: advanced features disabled');
  }
}, { name: 'conditionalEffect' });

// Derived dependencies
const firstName = state('John', { name: 'firstName' });
const lastName = state('Doe', { name: 'lastName' });

const fullName = derived(() => \`\${firstName()} \${lastName()}\`, {
  name: 'fullName',
});

export const nameEffect = effect(() => {
  const name = fullName();
  console.log('effect: full name changed to', name);
  
  // This effect will re-run when either firstName or lastName changes
  // because it depends on the derived fullName
}, { name: 'nameEffect' });