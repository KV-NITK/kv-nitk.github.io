import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kv-nitk.github.io/', // This matches your GitHub Pages URL structure
  build: {
    outDir: 'build', // Keep the same output directory for GitHub Pages compatibility
    sourcemap: true
  },
  server: {
    port: 5173,
    open: true
  }
})
