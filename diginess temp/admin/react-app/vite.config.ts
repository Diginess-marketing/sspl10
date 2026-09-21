import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@types', replacement: path.resolve(__dirname, './src/types') },
      { find: '@layout', replacement: path.resolve(__dirname, './src/layout') },
      { find: '@lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@api', replacement: path.resolve(__dirname, './src/api') },
      { find: '@', replacement: path.resolve(__dirname, './src') }
    ],
  },
  server: {
    port: 3000,
    open: true,
  },
})
