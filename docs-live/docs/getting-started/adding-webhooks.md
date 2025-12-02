---
sidebar_position: 3
---

# Adding webhooks

Use the hosted API to create an API key, register a webhook, and fan out status payloads. The same flow applies when self-hosted.

## 1) Create an API key
```bash
API_KEY=$(curl -s -X POST https://mc-pulse.vercel.app/api/api-keys \
  -H "Content-Type: application/json" \
  -d '{"label":"starter key"}' | jq -r .key)
```

## 2) Register a webhook
```bash
curl -X POST https://mc-pulse.vercel.app/api/webhooks \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d '{"url":"https://example.com/hook","description":"discord alerts"}'
```

## 3) Notify all webhooks for that key
```bash
curl -X POST "https://mc-pulse.vercel.app/api/notify?host=arch.mc&type=java" \
  -H "x-api-key: ${API_KEY}"
```

Notes:
- Keep the returned API key; there is no list endpoint.
- You can also send `Authorization: ApiKey <KEY>` instead of `x-api-key`.
- The notify response includes per-webhook delivery results (`ok`, `status`/`error`).

More detail lives in the [API reference](../api.md) and [API keys and webhooks](../webhooks.md).
