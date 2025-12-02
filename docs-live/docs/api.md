---
sidebar_position: 3
---

# API reference

> Official API endpoints live at https://mc-pulse.vercel.app/api (no ports). The shape described here mirrors the hosted surface while covering what you get when you self-host.

Base path: `/api`

mc-pulse speaks JSON over HTTP. Query parameters are optional unless noted; sensible defaults are applied from your `.env`.

### Common query parameters
- `host` — target server host. Defaults to `DEFAULT_SERVER_HOST` when omitted.
- `port` — target port. Defaults to:
  - Java: `DEFAULT_SERVER_PORT` (env)
  - Bedrock: `19132`
- `type` — `java` (default) or `bedrock`.

### Status payload
Every status lookup returns the same shape:

```json
{
  "host": "arch.mc",
  "port": 25565,
  "type": "java",
  "online": true,
  "latencyMs": 68,
  "playersOnline": 12,
  "playersMax": 100,
  "version": "1.21.1",
  "motd": "Welcome to Arch SMP",
  "checkedAt": "2025-01-01T12:00:00.000Z"
}
```

## Endpoints

### GET `/api/status`
Ping a server (Java by default). Accepts the common query parameters above. Java lookups are cached in Redis for `CACHE_TTL_SECONDS`.

### GET `/api/status/:type`
Explicitly target `java` or `bedrock` via the path. Query parameters for host/port behave the same as `/api/status`.

### POST `/api/notify` (alias: `/api/status/notify`)
Fetch status and broadcast it to every webhook registered to the provided API key.

Headers:
- `x-api-key: <KEY>` (preferred), or
- `Authorization: ApiKey <KEY>`

Query parameters: same as `GET /api/status`.

Response:
```json
{
  "status": {
    "host": "arch.mc",
    "port": 25565,
    "type": "java",
    "online": true,
    "latencyMs": 68,
    "playersOnline": 12,
    "playersMax": 100,
    "version": "1.21.1",
    "motd": "Welcome to Arch SMP",
    "checkedAt": "2025-01-01T12:00:00.000Z"
  },
  "deliveries": [
    { "id": "hook_123", "url": "https://example.com/webhook", "ok": true, "status": 200 },
    { "id": "hook_456", "url": "https://example.com/fail", "ok": false, "error": "..." }
  ]
}
```

## Error responses
- `400` — invalid query/body; response includes a `details` object describing the validation errors.
- `401` — missing/invalid API key (for endpoints that require auth).
- `500` — unexpected error while pinging, querying Redis, or hitting the database.

## Defaults and caching
- Java lookups are cached in Redis with TTL `CACHE_TTL_SECONDS`; Bedrock lookups skip cache so you always get a fresh result.
- When `host` or `port` are omitted, the service falls back to the defaults configured in `.env`.
- Each status call upserts a `Server` record and stores a `StatusSnapshot` in Postgres so you can build history or analytics later.
