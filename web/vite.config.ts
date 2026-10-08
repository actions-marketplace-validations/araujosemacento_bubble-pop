import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  base: '/bubble-pop/',
  build: {
    outDir: resolve(import.meta.dirname, '../dist-web'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@core': resolve(import.meta.dirname, '../src'),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
