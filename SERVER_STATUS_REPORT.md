# Server Deployment & Status Assessment Report

**Target Host**: `10.14.0.80` (`kannadavedike.nitk.ac.in`)  
**Inspection Date & Time**: August 28, 2026 — 20:58 IST  
**Environment**: Production Ubuntu Server (Ubuntu 18.04 LTS / Linux 5.4.0)

---

## Executive Summary

An audit of the server (`10.14.0.80`) was conducted by connecting via SSH (`kannadavedike@10.14.0.80`). 

- **Git Branch Status**: The working directory at `~/kv-nitk.github.io` is checked out to branch **`codex/backend-handoff-alignment`** (Commit `2809f10`). All PR changes from this branch have been merged into **`origin/master`** (Commit `451e535`), making the local copy in sync with the latest upstream code.
- **Backend Service Status**: `kv-backend.service` (Node.js 20.19.5 running Express) is **ACTIVE (running)** on port `5000` via `systemd`. The API health check returns `200 OK`.
- **Frontend Serving Status**: Frontend assets compiled from `codex/backend-handoff-alignment` (`index-DAJpkOnC.js` / `index-CpvjDggd.css`) are actively served by **Nginx** from `/var/www/kannadavedike/kv-nitk.github.io`. Both HTTP (`:80`) and HTTPS (`:443`) are functioning properly with Let's Encrypt SSL.
- **CI/CD Integration**: A self-hosted **GitHub Actions Runner** (`Runner.Listener`) is active and running in the background as a service under `/home/kannadavedike/actions-runner`.

---

## 1. Branch & Git Status Analysis

- **Current Repository Path**: `/home/kannadavedike/kv-nitk.github.io`
- **Active Checked-Out Branch**: `codex/backend-handoff-alignment`
- **Head Commit on Server**: `2809f10` (*"Match dashboard state route to backend"*)
- **Upstream Alignment**:
  - `origin/master` is at `451e535` (*"Merge pull request #21 from adarshs14193/backend-handoff-alignment"*).
  - The local `codex/backend-handoff-alignment` commits are fully merged into `origin/master`.
  - Git working tree is clean with only local deployment script untracked files (`deploy.sh`, `deploy-fast.sh`, `server/cookies.txt`).

---

## 2. Frontend Deployment Status & `deploy.sh` Deep-Dive

- **Served Root Directory**: `/var/www/kannadavedike/kv-nitk.github.io`
- **Active Compiled Bundle**:
  - **JS Entry Point**: `/assets/index-DAJpkOnC.js`
  - **CSS Style Entry**: `/assets/index-CpvjDggd.css`
- **Nginx Web Server Configuration**:
  - `listen 80` (HTTP) and `listen 443 ssl` (HTTPS with Let's Encrypt certificates).
  - SPA Fallback Rule: `try_files $uri $uri/ /index.html` routes all client-side paths to `index.html` so React Router handles navigation cleanly without 404 errors.

### What `deploy.sh` Does (Step-by-Step Execution)
The `deploy.sh` shell script automates building and deploying the frontend:
1. **Directory Validation**: Confirms `package.json` exists in `~/kv-nitk.github.io`.
2. **Git Synchronization**: Runs `git pull origin master` to retrieve latest commits.
3. **Dependency Installation**: Executes `npm install` to install/update npm packages.
4. **Vite Build**: Executes `npm run build` to compile production static bundles into `build/`.
5. **Automated Backup**: Creates a timestamped backup of the live site in `~/backups/kannadavedike-YYYYMMDD-HHMMSS`.
6. **File Deployment**: Copies `build/*` to Nginx serving directory `/var/www/kannadavedike/kv-nitk.github.io/`.
7. **Permission Setting**: Sets directory ownership to `www-data:www-data` and permissions to `755`.
8. **Nginx Verification**: Runs `sudo nginx -t` to test configuration file integrity.
9. **Zero-Downtime Reload**: Runs `sudo systemctl reload nginx` to apply changes without dropping active client HTTP connections.
10. **Deployment Verification**: Confirms presence of `index.html` in web directory and displays summary log.

---

## 3. Backend API Service, Lifecycle & Restart Mechanism

- **Systemd Unit File**: `/etc/systemd/system/kv-backend.service`
  ```ini
  [Unit]
  Description=Kannada Vedike Backend API
  After=network.target

  [Service]
  Type=simple
  User=kannadavedike
  WorkingDirectory=/home/kannadavedike/kv-nitk.github.io/server
  ExecStart=/usr/bin/node --env-file=.env src/server.js
  Restart=always
  RestartSec=5
  Environment=NODE_ENV=production

  [Install]
  WantedBy=multi-user.target
  ```

### How the Service Was Started for the 1st Time
To register and initialize `kv-backend.service` initially on the Ubuntu server:
1. **Unit File Creation**: The service configuration file above was created at `/etc/systemd/system/kv-backend.service`.
2. **Daemon Reload**: Systemd was notified of the new service:
   ```bash
   sudo systemctl daemon-reload
   ```
3. **Auto-Start Enablement**: The service was configured to boot automatically on system reboots:
   ```bash
   sudo systemctl enable kv-backend
   ```
4. **First-Time Service Start**: The service was launched immediately:
   ```bash
   sudo systemctl start kv-backend
   ```

### What `sudo systemctl restart kv-backend` Does
When `systemctl restart kv-backend` is executed:
1. **Graceful Termination**: Systemd sends a `SIGTERM` signal to the currently running Node process PID. The process closes active socket connections and terminates cleanly.
2. **Process Spawn**: Systemd instantly spawns a new Node instance running `/usr/bin/node --env-file=.env src/server.js`.
3. **Fresh Code & Env Load**: The new Node process re-reads the latest `.env` environment variables and imports updated JavaScript controller/service files from `/home/kannadavedike/kv-nitk.github.io/server`.
4. **Auto-Recovery Guarantee**: If the process ever crashes unexpectedly, `Restart=always` with `RestartSec=5` automatically re-launches it 5 seconds later.

---

## 4. Automation & Updating Workflow

### Automated CI/CD Workflow (`.github/workflows/ci-cd.yml`)
When code is pushed to `master`:
1. GitHub Actions triggers `test-and-verify` job to test build syntax.
2. The self-hosted runner on `10.14.0.80` executes `deploy-to-nitk-server` job:
   ```bash
   cd /home/kannadavedike/kv-nitk.github.io
   git pull origin master
   echo [REDACTED_PASSWORD] | sudo -S systemctl restart kv-backend
   npm run build
   sudo bash -c 'cp -r build/* /var/www/kannadavedike/kv-nitk.github.io/ && chown -R www-data:www-data /var/www/kannadavedike && systemctl reload nginx'
   ```

---

## Summary Matrix

| Component | Management Tool | Status | Update Mechanism |
|---|---|---|---|
| **Git Repo** | Git (`origin/master`) | Clean / Merged | `git pull origin master` |
| **Frontend** | Nginx (`/var/www/...`) | Online (`200 OK`) | `deploy.sh` OR Push to `master` |
| **Backend API** | Systemd (`kv-backend`) | Active (`running`) | `sudo systemctl restart kv-backend` |
| **SSL / HTTPS** | Let's Encrypt | Valid | Auto-renewed via certbot |
| **CI/CD** | GitHub Actions Runner | Active Service | Automated on push to `master` |
