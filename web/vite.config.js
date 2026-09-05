import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard Vite React setup. The /api folder is NOT touched by Vite —
// Vercel builds those separately as serverless functions.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
