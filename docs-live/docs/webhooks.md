---
sidebar_position: 4
---

# API keys and webhooks

> The hosted service at https://mc-pulse.vercel.app/api uses the same API keys and webhook flows described below; run mc-pulse yourself to mirror this behavior, or hit the Vercel deployment directly.

mc-pulse uses API keys to scope webhooks and authorize notifications. Keys are not listed anywhere—store them safely when created.

## Create an API key
`POST /api/api-keys`

Body:
```json
{ "label": "discord bot" }
```

Response:
```json
{ "id": "ck...", "key": "key_abc123", "label": "discord bot", "createdAt": "..." }
```

> Keys can be revoked by setting `revoked` to `true` in the database. There is no HTTP revoke endpoint yet.

## Webhook endpoints
All webhook routes require a valid API key in `x-api-key` or `Authorization: ApiKey <KEY>`.

### List webhooks
`GET /api/webhooks`

Returns the webhooks tied to the provided API key, newest first.

### Create webhook
`POST /api/webhooks`

Body:
```json
{ "url": "https://example.com/hook", "description": "discord alerts" }
```

Returns the created webhook record.

### Delete webhook
`DELETE /api/webhooks/:id`

Deletes the webhook if it belongs to the provided API key. Returns `204 No Content` when successful.

## Delivering notifications
`POST /api/notify` (alias `/api/status/notify`)

1. mc-pulse fetches the server status using the same query parameters as `GET /api/status`.
2. The status payload is POSTed to each webhook URL attached to the API key.
3. The response includes delivery results per webhook (`ok`, `status` or `error`).

Example:
```bash
curl -X POST "http://localhost:${PORT:-3000}/api/notify?host=arch.mc&type=java" \
  -H "x-api-key: key_abc123"
```

Tip: Use unique API keys per integration so you can rotate or revoke them independently.
