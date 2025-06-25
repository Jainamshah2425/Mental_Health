import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Ensure correct asset paths for Vercel deployment
  server: {
    proxy: {
      '/api': {
        target: 'https://mental-health-r9h9.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});