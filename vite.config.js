import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Dev port is 5173 unless VITE_DEV_PORT says otherwise (e.g. another project is using 5173)
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.VITE_DEV_PORT) || 5173

  return {
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
    port: devPort,
    // Fail instead of silently moving to another port: the IRIS login and the Cashfree
    // return URL (FRONTEND_URL / CASHFREE_RETURN_URL in server/.env) use this exact port.
    strictPort: true,
    // IRIS login only works on kannadavedike.dev.local (cookies are per host name)
    open: `http://kannadavedike.dev.local:${devPort}`,
    allowedHosts: true,
    // Local dev: the frontend calls /api on its own origin and Vite forwards it to
    // the Node server, so the IRIS login cookies end up on the same host.
    // Open the site at http://kannadavedike.dev.local:<port> (see /etc/hosts), not localhost.
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'https://kannadavedike.dev.local:5000',
        secure: false, // the dev server uses a self-signed certificate
      },
    },
  }
}
})
