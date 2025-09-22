import { state } from 'react-understate';

const counter = state(0);
const settings = state({ theme: 'light', lang: 'en' });

// Read values directly
console.log(counter.value); // 0
console.log(settings.value.theme); // 'light'

// Update values directly
counter.value = 10;
counter.value++; // Now 11

// Update objects (always replace the entire object)
settings.value = { ...settings.value, theme: 'dark' };

// Or completely replace
settings.value = { theme: 'auto', lang: 'fr' };