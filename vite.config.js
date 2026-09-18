import { defineConfig } from 'vite';

export default defineConfig({
  // A pasta public/ é copiada para dist/ na raiz pelo Vite automaticamente
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
