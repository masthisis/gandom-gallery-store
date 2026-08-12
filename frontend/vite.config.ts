import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: 'http://localhost:1337', changeOrigin: true },
      '/uploads': { target: 'http://localhost:1337', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router')) return 'router'
          if (id.includes('react-dom') || id.includes('/react/') || id.endsWith('/react')) return 'react'
          if (id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
})
