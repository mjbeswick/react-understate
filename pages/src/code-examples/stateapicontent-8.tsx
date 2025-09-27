const settings = state({ theme: 'light', lang: 'en' });

// ❌ Wrong - mutating doesn't trigger updates
settings.value.theme = 'dark'; // Won't update components!

// ✅ Correct - replace the object
settings.value = { ...settings.value, theme: 'dark' };

// ✅ Also correct - completely new object
settings.value = { theme: 'dark', lang: 'en' };
