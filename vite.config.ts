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
    sourcemap: false,
    rollupOptions: {
      output: {
        // Optimized chunk splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'state': ['zustand'],
          'date-utils': ['date-fns'],
          'icons': ['lucide-react'],
          'utils': ['clsx', 'tailwind-merge', 'qrcode.react'],
        },
        // Optimize asset naming for better caching
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name].[hash][extname]`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`
          }
          return `assets/[name].[hash][extname]`
        },
      },
    },
    // Production optimizations
    minify: 'terser',
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      output: {
        comments: false,
      },
    },
    reportCompressedSize: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets (< 4KB) as base64
  },
  // Asset handling optimizations
  assetsInclude: ['**/*.webp', '**/*.avif'],
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