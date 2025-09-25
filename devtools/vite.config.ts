import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      apply: 'build',
      writeBundle() {
        const src = path.resolve(__dirname, 'manifest.json');
        const dest = path.resolve(__dirname, 'dist/manifest.json');
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        devtools: path.resolve(__dirname, 'devtools.html'),
        panel: path.resolve(__dirname, 'panel.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts'),
        injected: path.resolve(__dirname, 'src/injected.ts'),
      },
      output: {
        entryFileNames: chunk => `${chunk.name}.js`,
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: asset => {
          if (asset.name?.endsWith('.css')) return `${asset.name}`;
          return 'assets/[name][extname]';
        },
      },
    },
  },
});
