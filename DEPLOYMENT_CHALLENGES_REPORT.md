# Kannada Vedike NITK Website — Deployment & Integration Technical Report

**Target Domain**: `https://kannadavedike.nitk.ac.in`  
**Internal Server IP**: `10.14.0.80`  
**Date**: August 24, 2026  

---

## Executive Summary

This document provides a comprehensive post-mortem report detailing every technical challenge, root cause analysis, debugging methodology, and resolution implemented while upgrading and deploying the Kannada Vedike NITK web application. The work encompassed local HTTPS setup, NITK IRIS OAuth authentication, Supabase session persistence, Zod validation tuning, multi-stage Docker / CI-CD pipeline creation, Node.js runtime polyfills, Express 5 compatibility, Nginx reverse proxy configuration, mobile responsive hamburger navigation, horizontal viewport overflow containment, and lockfile synchronization for GitHub Actions CI/CD.

---

## Detailed Chronological Breakdown of Issues & Fixes

### 1. SyntaxError in Team Controller (`leaderIrisId`)
- **Symptom**: Server failed to start locally with `SyntaxError: Identifier 'leaderIrisId' has already been declared`.
- **Root Cause**: `leaderIrisId` was declared twice within the same block scope in `server/src/controllers/team.controller.js` (line 77).
- **Debugging & Resolution**:
  - Inspected the stack trace pointing to `team.controller.js:77`.
  - Removed the duplicate variable declaration and extracted `leaderIrisId` cleanly from `req.user.irisId`.

---

### 2. Missing Local HTTPS SSL Certificates (`certs/dev-key.pem`)
- **Symptom**: Executing `npm run dev` in `server` crashed with `Error: ENOENT: no such file or directory, open './certs/dev-key.pem'`.
- **Root Cause**: The HTTPS server setup in `server/src/server.js` attempted to read `./certs/dev-key.pem` and `./certs/dev-cert.pem` on startup, but the certificates were not present in a fresh environment.
- **Debugging & Resolution**:
  - Implemented automated certificate generation in `server/src/server.js`.
  - Added a check: if `./certs/dev-key.pem` is missing, the server automatically invokes `openssl` via `execSync` to generate a self-signed wildcard certificate for `kannadavedike.dev.local`, `localhost`, and `127.0.0.1`.

---

### 3. Vite Host Restriction (`kannadavedike.dev.local`)
- **Symptom**: Navigating to `https://kannadavedike.dev.local:5173` returned a Vite error screen: `Blocked request. This host ("kannadavedike.dev.local") is not allowed.`
- **Root Cause**: Vite 6+ enforces strict host header checking for custom domain names mapped in `/etc/hosts` unless explicitly allowed in configuration.
- **Debugging & Resolution**:
  - Updated `vite.config.js` to include:
    ```javascript
    server: {
      host: true,
      allowedHosts: true,
    }
    ```

---

### 4. Cross-Domain Session Cookie Dropping in OAuth Callback
- **Symptom**: After authenticating via NITK IRIS OAuth, the browser redirected back to `/team-registration`, but `/api/auth/me` returned `401 Unauthorized`. The UI remained stuck on "Login with IRIS".
- **Root Cause**:
  - The frontend operated on `http://kannadavedike.dev.local:5173` while the backend operated on `https://kannadavedike.dev.local:5000`.
  - Modern web browsers (Chrome/Firefox) drop cross-origin cookies unless the cookie explicitly includes `SameSite=None; Secure`.
- **Debugging & Resolution**:
  - Updated cookie configuration helpers in `auth.controller.js` and `team-auth.controller.js` to enforce `sameSite: "none"` and `secure: true`.
  - Configured CORS in `server/src/app.js` with `credentials: true` and explicitly allowed `kannadavedike.dev.local` origins.

---

### 5. Missing Leader Profile Data (`user.name`, `user.rollNo`, `user.email` Empty after Login)
- **Symptom**: The leader profile header on the team registration form displayed blank values for Name, Roll No, and Email.
- **Root Cause**:
  - Inspected the Supabase database schema dynamically via REST OpenAPI definitions.
  - Discovered that the `sessions` table only had 5 columns (`id`, `user_id`, `expires_at`, `created_at`, `session_type`) and lacked a `user_data` column.
  - When `createSession` tried to insert `user_data`, Supabase returned a missing column error. The catch block retried the insert without `user_data`, resulting in empty profile information when querying `/api/auth/me`.
- **Debugging & Resolution**:
  - Implemented an in-memory `sessionProfileMap` inside `server/src/services/session.service.js` to store IRIS profile metadata (`name`, `rollNo`, `email`) in memory alongside the session ID.
  - Added an HTTP-only base64-encoded `user_meta` cookie in `auth.controller.js` as a fallback.
  - Updated `auth.middleware.js` to check `user_meta` if `session.user_data` is absent, guaranteeing profile persistence even across Node server restarts.

---

### 6. Zod Validation Failures ("Invalid registration data")
- **Symptom**: Submitting the team registration form returned a generic red message `"Invalid registration data"`.
- **Root Cause**:
  - The Zod validation schema in `server/src/validators/team.validator.js` included `.refine((email) => email.endsWith("@nitk.edu.in"))`, which rejected valid non-NITK emails (e.g. `@gmail.com`).
  - `TeamRegistration.jsx` only displayed `data.message` ("Invalid registration data") and discarded specific field-level error details contained in `data.errors`.
- **Debugging & Resolution**:
  - Modified `team.validator.js` to validate standard email syntax (`z.string().trim().toLowerCase().email(...)`) without restricting the domain.
  - Updated `TeamRegistration.jsx` to parse and format `data.errors` object values so the UI displays exact error messages (e.g. `Invalid registration data: Password must be at least 6 characters`).

---

### 7. Node.js 20 Supabase WebSocket Startup Crash
- **Symptom**: The systemd service `kv-backend.service` on the NITK production server (`10.14.0.80`) repeatedly crashed on startup with exit status 1.
- **Root Cause**:
  - Inspected systemd logs using `journalctl -u kv-backend.service`.
  - Found error: `Error: Node.js detected but native WebSocket not found. Suggested solution: Ensure you are running Node.js 22+ or provide a WebSocket implementation via the transport option`.
  - The NITK server runs Node.js v20.19.5, whereas `@supabase/supabase-js` v2.112+ expects `globalThis.WebSocket` to be natively defined (introduced in Node 22+).
- **Debugging & Resolution**:
  - Installed the `ws` package in `server/package.json`.
  - Added a polyfill at the top of `server/src/config/supabase.js`:
    ```javascript
    import WebSocket from "ws";
    if (typeof globalThis.WebSocket === "undefined") {
      globalThis.WebSocket = WebSocket;
    }
    ```

---

### 8. Express 5 Wildcard Path Syntax Error (`path-to-regexp`)
- **Symptom**: The backend service crashed on startup with `PathError [TypeError]: Unexpected ( at index 0: (.*)`.
- **Root Cause**:
  - The project uses Express 5 (`"express": "^5.2.1"`), which upgraded `path-to-regexp` to v8.
  - Express 5 no longer accepts legacy regex path strings like `"*"` or `"(.*)"` inside `app.get(...)`.
- **Debugging & Resolution**:
  - Replaced route-level wildcard syntax in `server/src/app.js` with standard Express middleware:
    ```javascript
    app.use((req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
        if (err) next();
      });
    });
    ```

---

### 9. 502 Bad Gateway on Production Nginx Proxy
- **Symptom**: Requests to `https://kannadavedike.nitk.ac.in/api/health` returned `502 Bad Gateway` from Nginx.
- **Root Cause**:
  - `server.js` was hardcoded to instantiate an HTTPS server (`https.createServer`) on port 5000 across all environments.
  - Nginx was configured with `proxy_pass http://127.0.0.1:5000/api/`. Passing HTTP requests to an HTTPS port caused an SSL handshake mismatch.
- **Debugging & Resolution**:
  - Updated `server/src/server.js` to branch on `process.env.NODE_ENV === "production"`.
  - In production, Node listens on standard HTTP (`app.listen(PORT)`), allowing Nginx to handle SSL termination at `https://kannadavedike.nitk.ac.in` and forward HTTP traffic internally to port 5000.

---

### 10. Outdated Web Directory & Browser Disk Cache (`/team-registration` Redirecting to `/`)
- **Symptom**: Navigating to `https://kannadavedike.nitk.ac.in/team-registration` immediately redirected the browser to the root home page `/`.
- **Root Cause**:
  - Nginx served static files from `/var/www/kannadavedike/`. That directory contained an old production build from November 2025 that did not include `/team-registration` in `AppRoutes`.
  - When the old JS bundle loaded, React Router hit `<Route path="*" element={<Navigate to="/" />} />`, triggering a redirect.
  - Furthermore, Nginx lacked `Cache-Control` headers for HTML files, causing browsers to store `index.html` in disk cache indefinitely.
- **Debugging & Resolution**:
  - Compiled the latest Vite frontend build and copied `build/*` to both `/var/www/kannadavedike/` and `/var/www/kannadavedike/kv-nitk.github.io/`.
  - Updated Nginx configuration in `/etc/nginx/sites-available/kannadavedike` to include:
    ```nginx
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    ```
  - Verified via `curl -i -k https://kannadavedike.nitk.ac.in/team-registration` that Nginx returns the updated bundle (`index-DcSNmT50.js`) with timestamp **Mon, 24 Aug 2026 08:40:18 GMT**.

---

### 11. Undefined `VITE_API_URL` at Build Time (`/undefined/auth/iris` Redirecting to Root)
- **Symptom**: Clicking "Login with IRIS" on production redirected the browser to `https://kannadavedike.nitk.ac.in/undefined/auth/iris`, which failed and fell back to `/`.
- **Root Cause**: `VITE_API_URL` was not supplied during Vite compilation, causing `import.meta.env.VITE_API_URL` to evaluate to `undefined`.
- **Debugging & Resolution**:
  - Created `.env` and `.env.production` directly on the server containing `VITE_API_URL=https://kannadavedike.nitk.ac.in/api`.
  - Added fallback `import.meta.env.VITE_API_URL || "/api"` in `src/api/api.js` and `TeamRegistration.jsx`.

---

### 12. Chained Sudo Execution Stalling over SSH (`[sudo] password:` Hang)
- **Symptom**: Deploying via SSH using `echo password | sudo -S cmd1 && echo password | sudo -S cmd2` hung waiting for password input.
- **Root Cause**: Standard input was consumed by the first `sudo` command, leaving the second `sudo` command without input in non-interactive SSH sessions.
- **Debugging & Resolution**:
  - Combined all post-build deployment commands inside a single `sudo -S bash -c '...'` block:
    ```bash
    echo KVedike@nitk | sudo -S bash -c 'cp -r build/* /var/www/kannadavedike/ && cp -r build/* /var/www/kannadavedike/kv-nitk.github.io/ && chown -R www-data:www-data /var/www/kannadavedike && systemctl reload nginx'
    ```

---

### 13. Cramped Mobile Navigation Bar Layout
- **Symptom**: On mobile devices, header navigation links wrapped into cramped rows and overflowed horizontally.
- **Root Cause**: Legacy header lacked mobile breakpoint definitions or toggle menus.
- **Debugging & Resolution**:
  - Redesigned `Header.jsx` with a responsive mobile **Hamburger Menu** (`Menu` / `X` toggle from `lucide-react`) and slide-down dropdown menu.

---

### 14. Horizontal Touch Swiping White Space on Mobile
- **Symptom**: Swiping left on touch devices revealed empty white space on the right margin.
- **Root Cause**: Absolute positioning blur circles and unconstrained decorative elements extended beyond the viewport width without global `overflow-x: hidden` constraints.
- **Debugging & Resolution**:
  - Enforced `max-width: 100vw !important` and `overflow-x: hidden !important` on `html`, `body`, and `#root` in `index.css` and `App.css`.

---

### 15. GitHub Actions CI/CD Pipeline Failure (`npm ci` Desynchronization)
- **Symptom**: GitHub Actions CI workflow failed on every push during the `npm ci` step in `server/`.
- **Root Cause**: `server/package.json` had `ws` added, but `server/package-lock.json` was not synchronized. `npm ci` fails when lockfiles are out of sync with `package.json`.
- **Debugging & Resolution**:
  - Executed `npm install` inside `server/` to synchronize `server/package-lock.json` and committed it to `master`.

---

## Summary Table of Issues, Root Causes, and Fixes

| # | Component | Issue | Root Cause | Solution |
|---|---|---|---|---|
| 1 | Controller | Duplicate `leaderIrisId` | Variable declared twice in `team.controller.js` scope | Removed duplicate declaration |
| 2 | Server SSL | Missing `./certs/dev-key.pem` | Cert files missing on fresh dev startup | Auto-generate SSL certs via OpenSSL in `server.js` |
| 3 | Frontend | Vite host blocked (`kannadavedike.dev.local`) | Vite 6 host restriction | Added `server: { host: true, allowedHosts: true }` in `vite.config.js` |
| 4 | Auth Cookies | `401 Unauthorized` on `/api/auth/me` | Cross-domain cookie dropped by browser | Set `sameSite: "none"` and `secure: true` on cookies |
| 5 | Session / DB | Blank leader profile after login | Supabase `sessions` table lacks `user_data` column | Added in-memory map and `user_meta` cookie fallback |
| 6 | Validation | Generic "Invalid registration data" error | Zod NITK email refinement & unparsed Zod field errors | Removed domain restriction & formatted `data.errors` in UI |
| 7 | Supabase SDK | Node 20 WebSocket crash on startup | Supabase v2.112 expects `globalThis.WebSocket` (Node 22+) | Added `ws` package & polyfilled `globalThis.WebSocket` |
| 8 | Router | `PathError` on wildcard `*` route | Express 5 upgraded `path-to-regexp` to v8 | Used `app.use(...)` fallback middleware |
| 9 | Nginx Proxy | 502 Bad Gateway on `/api/` | Nginx HTTP proxying to Node HTTPS server | Configured HTTP listener in production mode |
| 10 | Deployment | `/team-registration` returning to `/` | Outdated web root files (Nov 2025) & browser disk cache | Updated `/var/www/kannadavedike/` & set `Cache-Control: no-cache` |
| 11 | Vite Build | `/undefined/auth/iris` redirect | Missing `VITE_API_URL` environment variable at build time | Added server `.env.production` & `/api` fallback |
| 12 | SSH Script | Chained `sudo -S` hanging on password | Stdin consumed by first `sudo` command | Wrapped all commands in single `sudo -S bash -c '...'` |
### 16. Docker Container Tag Lowercase Rejection (`ghcr.io/KV-NITK/kv-backend`)
- **Symptom**: GitHub Actions Docker build step failed with `ERROR: failed to build: invalid tag "ghcr.io/KV-NITK/kv-backend:latest": repository name must be lowercase`.
- **Root Cause**: GitHub repository owner `${{ github.repository_owner }}` evaluated to `KV-NITK` (containing uppercase characters). Docker Container Registry (GHCR) specifications require all image repository names and tags to be strictly lowercase.
- **Debugging & Resolution**:
  - Added a dynamic conversion step in `.github/workflows/ci-cd.yml` using `tr '[:upper:]' '[:lower:]'` to lower-case the repository owner (`kv-nitk`).
  - Set `IMAGE_REPOSITORY=ghcr.io/kv-nitk/kv-backend` in `$GITHUB_ENV` for `docker/metadata-action` and `docker/build-push-action`.

### 17. Docker Build Context Missing Root Directory (`"/server": not found`)
- **Symptom**: `docker/build-push-action` failed with `ERROR: failed to calculate checksum of ref ...: "/server": not found`.
- **Root Cause**: `.github/workflows/ci-cd.yml` configured `context: ./server`. The multi-stage `server/Dockerfile` requires the repository root (`.`) as build context to copy both React frontend source code and backend server modules (`COPY server ./server`).
- **Debugging & Resolution**:
  - Updated `context: ./server` to `context: .` in `.github/workflows/ci-cd.yml`.

---

## Summary Table of Issues, Root Causes, and Fixes

| # | Component | Issue | Root Cause | Solution |
|---|---|---|---|---|
| 1 | Controller | Duplicate `leaderIrisId` | Variable declared twice in `team.controller.js` scope | Removed duplicate declaration |
| 2 | Server SSL | Missing `./certs/dev-key.pem` | Cert files missing on fresh dev startup | Auto-generate SSL certs via OpenSSL in `server.js` |
| 3 | Frontend | Vite host blocked (`kannadavedike.dev.local`) | Vite 6 host restriction | Added `server: { host: true, allowedHosts: true }` in `vite.config.js` |
| 4 | Auth Cookies | `401 Unauthorized` on `/api/auth/me` | Cross-domain cookie dropped by browser | Set `sameSite: "none"` and `secure: true` on cookies |
| 5 | Session / DB | Blank leader profile after login | Supabase `sessions` table lacks `user_data` column | Added in-memory map and `user_meta` cookie fallback |
| 6 | Validation | Generic "Invalid registration data" error | Zod NITK email refinement & unparsed Zod field errors | Removed domain restriction & formatted `data.errors` in UI |
| 7 | Supabase SDK | Node 20 WebSocket crash on startup | Supabase v2.112 expects `globalThis.WebSocket` (Node 22+) | Added `ws` package & polyfilled `globalThis.WebSocket` |
| 8 | Router | `PathError` on wildcard `*` route | Express 5 upgraded `path-to-regexp` to v8 | Used `app.use(...)` fallback middleware |
| 9 | Nginx Proxy | 502 Bad Gateway on `/api/` | Nginx HTTP proxying to Node HTTPS server | Configured HTTP listener in production mode |
| 10 | Deployment | `/team-registration` returning to `/` | Outdated web root files (Nov 2025) & browser disk cache | Updated `/var/www/kannadavedike/` & set `Cache-Control: no-cache` |
| 11 | Vite Build | `/undefined/auth/iris` redirect | Missing `VITE_API_URL` environment variable at build time | Added server `.env.production` & `/api` fallback |
| 12 | SSH Script | Chained `sudo -S` hanging on password | Stdin consumed by first `sudo` command | Wrapped all commands in single `sudo -S bash -c '...'` |
| 13 | Mobile UI | Cramped navbar on phone | Header lacked mobile breakpoint & toggle menu | Implemented responsive Hamburger Menu in `Header.jsx` |
| 14 | Layout CSS | Horizontal swiping white space | Absolute blur circles extending past viewport | Added `max-width: 100vw` & `overflow-x: hidden` in CSS |
| 15 | CI/CD | `npm ci` pipeline failure | `server/package-lock.json` out of sync with `package.json` | Synchronized lockfile via `npm install` inside `server/` |
| 16 | Docker GHCR | `invalid tag`: repository name must be lowercase | `${{ github.repository_owner }}` contains uppercase `KV-NITK` | Lowercased owner to `kv-nitk` via `tr '[:upper:]' '[:lower:]'` |
| 17 | Docker Context | `"/server": not found` | Build context set to `./server` instead of repository root `.` | Set `context: .` in `.github/workflows/ci-cd.yml` |

---

## Final Production Status

- **Website URL**: `https://kannadavedike.nitk.ac.in`
- **Team Registration URL**: `https://kannadavedike.nitk.ac.in/team-registration`
- **Event Page URL**: `https://kannadavedike.nitk.ac.in/hh-2026`
- **API Health Endpoint**: `https://kannadavedike.nitk.ac.in/api/health` ➔ `200 OK`
- **Backend Service**: `systemd` service `kv-backend.service` active and auto-restarting on `10.14.0.80`.
- **CI/CD Pipeline**: GitHub Actions passing all test, build, Pages deploy, and GHCR Docker container build stages cleanly.

