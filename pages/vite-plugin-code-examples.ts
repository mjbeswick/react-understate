import { Plugin } from 'vite';
import fs from 'fs';
import { join, resolve } from 'path';

interface CodeExampleOptions {
  codeExamplesDir: string;
  importPrefix?: string;
}

export function codeExamplesPlugin(options: CodeExampleOptions): Plugin {
  const { codeExamplesDir, importPrefix = 'code-examples:' } = options;
  const codeExamplesPath = resolve(codeExamplesDir);

  // Cache for loaded code examples
  const codeCache = new Map<string, string>();

  // Load all code examples at plugin initialization
  function loadCodeExamples() {
    try {
      const files = fs.readdirSync(codeExamplesPath);

      for (const file of files) {
        if (
          file.endsWith('.ts') ||
          file.endsWith('.tsx') ||
          file.endsWith('.js') ||
          file.endsWith('.jsx')
        ) {
          const filePath = join(codeExamplesPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const key = file.replace(/\.(ts|tsx|js|jsx)$/, '');
          codeCache.set(key, content);
        }
      }
    } catch (error) {
      console.warn('Failed to load code examples:', error);
    }
  }

  return {
    name: 'code-examples',
    buildStart() {
      loadCodeExamples();
    },
    resolveId(id) {
      if (id.startsWith(importPrefix)) {
        return `\0${id}`; // mark as virtual to bypass other plugins
      }
    },
    load(id) {
      if (id.startsWith(`\0${importPrefix}`)) {
        const filename = id.slice(`\0${importPrefix}`.length);
        const code = codeCache.get(filename);

        if (code) {
          const sanitized = code
            // Prevent env replace plugins from touching strings
            .replace(/process\.env/g, 'process' + '.env');
          const b64 = Buffer.from(sanitized, 'utf8').toString('base64');
          return `export default (typeof atob !== 'undefined' ? atob('${b64}') : Buffer.from('${b64}','base64').toString('utf8'));`;
        } else {
          console.warn(`Code example not found: ${filename}`);
          return `export default '';`;
        }
      }
    },
  };
}
