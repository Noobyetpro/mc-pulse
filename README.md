# mc-pulse

Lightweight Minecraft server status API with webhook notifications (Java and Bedrock).

## Features
- Query server status (Java/Bedrock), caches Java responses in Redis.
- Upserts servers and stores snapshots in Postgres via Prisma.
- API key–protected webhooks: register endpoints and push status payloads on demand.

## Prereqs
- Node.js 18+ (ESM)
- Postgres (DATABASE_URL)
- Redis (REDIS_URL)

## Environment
Copy `.env.example` to `.env` and set:
- `PORT` (default 3000)
- `DATABASE_URL`
- `REDIS_URL`
- `DEFAULT_SERVER_HOST` (fallback Java host)
- `DEFAULT_SERVER_PORT` (fallback Java port, e.g., 25565)
- `CACHE_TTL_SECONDS` (TTL for cached Java status)

## Install
```bash
npm install
npx prisma generate
```

## Database
Apply migrations locally:
```bash
npx prisma migrate dev
```
Production deploy:
```bash
npx prisma migrate deploy
```

## Run
Dev (watch):
```bash
npm run dev
```
Build:
```bash
npm run build
```
Start built output:
```bash
npm start
```

## API
Base path: `/api`

- `GET /api/status`  
  Query params: `host?`, `port?`, `type?` (`java|bedrock`, default `java`).
- `GET /api/status/:type`  
  Path param `type` (`java|bedrock`), same query params for host/port.
- `POST /api/status/notify`  
  Header: `x-api-key`. Query params as above. Fetches status and POSTs JSON to all webhooks for that key.

API keys:
- `POST /api/api-keys` (body `{ "label"?: string }`) → create key.
- `GET /api/api-keys` → list keys.

Webhooks (API key required via `x-api-key`):
- `POST /api/webhooks` (body `{ "url": string, "description"?: string }`) → create.
- `GET /api/webhooks` → list.
- `DELETE /api/webhooks/:id` → delete.

Health:
- `GET /health` → `{ ok: true }`

## Quick test commands
```bash
# health
curl http://localhost:${PORT:-3000}/health

# create API key
curl -X POST http://localhost:${PORT:-3000}/api/api-keys \
  -H "Content-Type: application/json" -d '{"label":"local"}'

# status (Java)
curl "http://localhost:${PORT:-3000}/api/status/java?host=arch.mc"

# status (Bedrock)
curl "http://localhost:${PORT:-3000}/api/status/bedrock?host=sg.hivebedrock.network"

# create webhook (replace <API_KEY> and <URL>)
curl -X POST http://localhost:${PORT:-3000}/api/webhooks \
  -H "Content-Type: application/json" -H "x-api-key: <API_KEY>" \
  -d '{"url":"<URL>","description":"test"}'

# notify webhooks
curl -X POST "http://localhost:${PORT:-3000}/api/status/notify?host=arch.mc&type=java" \
  -H "x-api-key: <API_KEY>"
```

## Notes
- Redis is used for caching Java status only; Bedrock requests skip cache.
- Prisma client is generated from `prisma/schema.prisma`; regenerate after schema changes.
- Do not commit `.env` or API key