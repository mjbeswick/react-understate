// Utility function to load code examples from separate files
// This loads the actual extracted code files

export const loadCodeExample = async (filename: string): Promise<string> => {
  // Try src path (dev) first using ?raw
  try {
    const dev = await fetch(`/src/code-examples/${filename}?raw`);
    if (dev.ok) return await dev.text();
  } catch {}

  // Then try built public path (prod)
  try {
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const resp = await fetch(`${base}code-examples/${filename}`);
    if (resp.ok) return await resp.text();
  } catch {}

  return '';
};
