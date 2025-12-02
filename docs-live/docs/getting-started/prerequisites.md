---
sidebar_position: 1
---

# Prerequisites

Pick the path you need:

- **Hosted API (recommended to start):** nothing to install. Call `https://mc-pulse.vercel.app/api` directly over HTTPS (no ports).
- **Self-hosting:** Node.js **18+**, Postgres, and (optionally) Redis for Java cache. Redis is not required to boot the API, but Java lookups will skip cache without it.

Key defaults (hosted and self-hosted):

| Setting | Default | Notes |
| --- | --- | --- |
| Java port | `DEFAULT_SERVER_PORT` (env, default `25565`) | Override with `port` query param. |
| Bedrock port | `19132` | Override with `port` query param. |
| Cache TTL (Java) | `CACHE_TTL_SECONDS` (default `30s`) | Only Java lookups are cached. |

Need production or local control? Head to [Deploying on your own](../deployment.md) for environment, migrations, and process manager guidance.
