import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // `@/…` is src (as in components.json); `@p26/…` is the Parva 2026 page
      '@p26': fileURLToPath(new URL('./src/components/Parva26', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/', // This matches your GitHub Pages URL structure
  build: {
    outDir: 'build', // Keep the same output directory for GitHub Pages compatibility
    sourcemap: true
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    allowedHosts: true
  }
})
