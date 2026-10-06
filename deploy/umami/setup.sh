#!/usr/bin/env bash
# Run once on the campus server (10.14.0.80) from this folder: bash setup.sh
set -euo pipefail
cd "$(dirname "$0")"

command -v docker >/dev/null || { echo "Docker is not installed. Install it first (sudo apt install docker.io docker-compose-v2)."; exit 1; }

if [ ! -f .env ]; then
  umask 077
  printf 'UMAMI_DB_PASSWORD=%s\nUMAMI_APP_SECRET=%s\n' \
    "$(openssl rand -hex 16)" "$(openssl rand -hex 32)" > .env
  echo "Wrote .env with fresh secrets"
fi

sudo docker compose up -d
echo "Waiting for Umami..."
for _ in $(seq 1 30); do
  curl -fs http://127.0.0.1:3001/u.js >/dev/null && { echo "Umami is up on 127.0.0.1:3001"; break; }
  sleep 2
done

cat <<'EOF'

Next:
  1. Add the locations from nginx-umami.conf to the site's nginx server block, then: sudo nginx -t && sudo systemctl reload nginx
  2. Open the dashboard through an SSH tunnel (ssh -L 3001:127.0.0.1:3001 kannadavedike@10.14.0.80), http://localhost:3001
     Log in as admin / umami and CHANGE THE PASSWORD IMMEDIATELY.
  3. Settings > Websites > Add website (domain kannadavedike.nitk.ac.in). Copy the website ID and give it to Claude.
EOF
