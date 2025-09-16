import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/react-understate/',
  resolve: {
    alias: {
      'react-understate': path.resolve(
        __dirname,
        '../dist/react-understate.esm.js',
      ),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
