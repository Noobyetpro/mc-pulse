---
sidebar_position: 5
---

# Deploying on your own

> Official deployment is served from https://mc-pulse.vercel.app/ (no ports). Follow the steps below only when you need to run mc-pulse yourself; the hosted service already matches this behavior.

Self-hosted production playbook for mc-pulse.

## Prerequisites
- Node.js **18+**
- Postgres (mc_pulse schema is used)
- Redis (Java cache; optional but recommended)

## Local dev quickstart
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```
Smoke-test:
```bash
curl http://localhost:${PORT:-3000}/health
curl "http://localhost:${PORT:-3000}/api/status/java?host=arch.mc"
```

## Quick deploy path (production)
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
PORT=3000 npm start
```
Pair `npm start` with a process manager (systemd, pm2, Docker, etc.).

## Environment and secrets
Set these via your platform’s secrets or environment:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Points to Postgres (uses `mc_pulse` schema). |
| `REDIS_URL` | Redis for Java cache. Service still boots without it, but Java lookups skip cache. |
| `PORT` | Express listen port. |
| `CACHE_TTL_SECONDS` | Adjust freshness vs. Redis churn. |
| `DEFAULT_SERVER_HOST` / `DEFAULT_SERVER_PORT` | Fallbacks when host/port are omitted. |

## Systemd example (bare metal / VM)
`/etc/systemd/system/mc-pulse.service`:
```ini
[Unit]
Description=mc-pulse API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/mc-pulse
ExecStart=/usr/bin/node dist/index.js
Environment=PORT=3000
Environment=DATABASE_URL=...
Environment=REDIS_URL=...
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Docker-style start
Build locally and run in a container:
```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

docker run -d --name mc-pulse \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -v $(pwd)/dist:/app/dist \
  -w /app node:20-alpine \
  node dist/index.js
```

> For production images, bake dependencies and `dist/` into the image instead of mounting them.

## Database considerations
- Tables live in the `mc_pulse` schema: `Server`, `StatusSnapshot`, `ApiKey`, `Webhook`.
- Each status check upserts a server and stores a snapshot; tune polling to manage growth.
- No HTTP revoke endpoint yet: set `revoked = true` on an API key in Postgres to disable it.

## Redis
- Only Java lookups hit Redis (Bedrock bypasses cache).
- Startup continues if Redis is down; you will see warnings and cache skips in logs.

## Health and monitoring
- `GET /health` returns `{ "ok": true }`.
- Log webhook delivery results: responses include per-webhook status and errors to bubble up failures.
- Add reverse-proxy rate limiting if you expose the API publicly.

## Security tips
- Keep API keys server-side; do not embed them in frontends.
- Use a distinct API key per integration to rotate safely.
- Terminate TLS at your proxy or platform and enforce HTTPS for all clients.
