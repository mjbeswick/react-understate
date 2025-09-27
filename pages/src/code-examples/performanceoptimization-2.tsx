const settings = state({ theme: 'light', lang: 'en' });

// ❌ Wrong - mutating doesn't trigger updates
settings.value.theme = 'dark'; // Won't update components!

// ✅ Correct - replace the object
settings.value = { ...settings.value, theme: 'dark' };

// ✅ Also correct - completely new object
settings.value = { theme: 'dark', lang: 'en' };

// ✅ For arrays, use immutable operations
const items = state([1, 2, 3]);

// ❌ Wrong
items.value.push(4); // Won't trigger updates!

// ✅ Correct
items.value = [...items.value, 4];
items.value = items.value.filter(item => item !== 2);
