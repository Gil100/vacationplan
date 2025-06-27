import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/vacationplan/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['./src/components/ui'],
        },
      },
    },
    // Optimize for production
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  // Preview settings for testing production build locally
  preview: {
    port: 4173,
    open: true,
  },
})