import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 5173,
    strictPort: false,
    open: false
  },
  build: {
    target: 'es2020',
    outDir: 'dist'
  }
});
