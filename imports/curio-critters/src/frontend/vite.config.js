
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This makes the server accessible externally
    port: 50390,
    open: false // Don't automatically open browser
  },
  build: {
    outDir: 'dist'
  }
});
