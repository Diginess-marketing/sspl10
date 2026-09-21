
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('scheduler') || id.includes('@remix-run') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('date-fns') || id.includes('zod') || id.includes('react-hook-form') || id.includes('lucide-react')) {
              return 'vendor-utils';
            }
          }
        },
      },
    },
  },
});
