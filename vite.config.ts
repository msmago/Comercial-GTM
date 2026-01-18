import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Fix: cast process to any to avoid TypeScript error about missing cwd method in some environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), './'),
      },
    },
    // Removed define block that manually injected process.env variables.
    // According to Gemini API guidelines, process.env.API_KEY and other credentials 
    // should be handled and injected by the execution environment automatically.
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});