import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // This matches your GitHub Pages URL structure
  build: {
    outDir: 'build', // Keep the same output directory for GitHub Pages compatibility
    sourcemap: true
  },
  server: {
    port: 5173,
    open: true
  }
})
