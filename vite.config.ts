
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Isso permite que o código 'process.env.API_KEY' funcione no navegador
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
