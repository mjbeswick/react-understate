// Utility function to load code examples from separate files
// This loads the actual extracted code files

export const loadCodeExample = async (filename: string): Promise<string> => {
  try {
    // Try to load the actual file
    const base = (import.meta as any).env?.BASE_URL ?? '/';
    const response = await fetch(`${base}src/code-examples/${filename}`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.warn(`Failed to load code example: ${filename}`, error);
  }

  return '';
};
