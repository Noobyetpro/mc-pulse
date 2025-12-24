# mc-pulse

Status + webhook API for Minecraft servers (Java + Bedrock).

- Guide: https://mcpulse.vercel.app
- Hosted API base: https://mc-pulse.vercel.app/

## How it works
- Incoming requests hit Elysia routes in `src/`, all TypeScript/ESM.
- Status lookup:
  - Java queries go through `minecraft-server-util`, then responses are cached in Redis for `CACHE_TTL_SECONDS`. Cache key is derived from host/port/type to keep entries isolated.
  - Bedrock queries skip cache and fetch live data each time.
- API keys:
  - `POST /api/api-keys` issues a key stored in Postgres (via Prisma) with optional labels for identification.
  - Keys are required via `x-api-key` header for webhook-related endpoints and for broadcast notifications.
- Webhooks:
  - Clients register webhook URLs per API key (`POST /api/webhooks`); each entry records URL and optional description.
  - `POST /api/status/notify` fetches server status (honoring cache rules) and POSTs the JSON payload to every webhook tied to the provided key.
- Persistence:
  - Prisma models live in `prisma/schema.prisma`; servers and snapshots are recorded for auditing/history alongside API keys and webhooks.
  - `prisma.config.ts` wires the datasource and client generation; `bun run build` emits compiled JS to `dist/`.
- Validation and safety:
  - Request parameters are validated with `zod` before queries run.
  - Health probe at `/health` returns `{ ok: true }` to help load balancers and monitors.
- Dependencies and environment:
  - Bun 1.1+, Postgres URL (`DATABASE_URL`), Redis URL (`REDIS_URL`), optional defaults for Java host/port (`DEFAULT_SERVER_HOST`, `DEFAULT_SERVER_PORT`), port binding (`PORT`), and cache TTL (`CACHE_TTL_SECONDS`).
  - Scripts: `bun run dev` (watch), `bun run build` (tsc + Prisma client), `bun start` (run built output).

## API at a glance
- Base path: `/api`
- Status: `GET /api/status` (query `host`, `port`, `type=java|bedrock`)
- Notify webhooks: `POST /api/status/notify` (requires `x-api-key`)
- API keys: `POST /api/api-keys`, `GET /api/api-keys`
- Webhooks: `POST /api/webhooks`, `GET /api/webhooks`, `DELETE /api/webhooks/:id` (all require `x-api-key`)
- Health: `GET /health` -> `{ ok: true }`

For end-to-end setup, hosting options, and request examples, see the guide link above. For live endpoints, use the hosted API base link.
