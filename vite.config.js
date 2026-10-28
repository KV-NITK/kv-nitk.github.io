import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The dev address is set in ONE place: FRONTEND_URL in server/.env. Vite listens on its
  // port and opens it; the server uses the same value for the post-login redirect, CORS
  // and the Cashfree return URL. Change the port there and nowhere else.
  const rootEnv = loadEnv(mode, process.cwd(), '')
  const serverEnv = loadEnv(mode, fileURLToPath(new URL('./server', import.meta.url)), '')
  let frontendUrl
  try {
    frontendUrl = new URL(serverEnv.FRONTEND_URL || 'http://kannadavedike.dev.local:5173')
  } catch {
    frontendUrl = new URL('http://kannadavedike.dev.local:5173') // never break a build over a dev setting
  }
  const devPort = Number(frontendUrl.port) || 5173
  const apiProxyTarget =
    process.env.VITE_DEV_API_PROXY ||
    process.env.VITE_API_URL ||
    rootEnv.VITE_API_URL?.replace(/\/api\/?$/, '') ||
    'https://kannadavedike.dev.local:5000'

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
    // Fail instead of silently moving to another port: the IRIS login redirect and the
    // Cashfree return URL are built from FRONTEND_URL, so they need this exact port.
    strictPort: true,
    // IRIS login only works on kannadavedike.dev.local (cookies are per host name)
    open: frontendUrl.origin,
    allowedHosts: true,
    // Local dev: the frontend calls /api on its own origin and Vite forwards it to
    // the Node server, so the IRIS login cookies end up on the same host.
    // Open the site at http://kannadavedike.dev.local:<port> (see /etc/hosts), not localhost.
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Proxy error', message: err.message }))
            }
          })
        },
      },
      '/auth': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Proxy error', message: err.message }))
            }
          })
        },
      },
    },
  }
}
})
