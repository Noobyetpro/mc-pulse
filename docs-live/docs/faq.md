---
sidebar_position: 6
---

# FAQ

**Do I need Redis?**  
Redis is only used to cache Java status responses. The API still runs without it (you will see a warning), but every Java request will ping the server directly.

**What ports are used by default?**  
Java: `DEFAULT_SERVER_PORT` (env, default `25565`). Bedrock: `19132` when no port is provided.

**Can I see or rotate API keys?**  
Keys are write-only for now. Create a new key with `POST /api/api-keys`, update your consumers, then set `revoked` to `true` on the old key in the database to block it.

**Where is data stored?**  
Servers, API keys, webhooks, and status snapshots live in Postgres under the `mc_pulse` schema. Redis only holds short-lived Java cache entries.

**How often should I poll?**  
Use `CACHE_TTL_SECONDS` to balance freshness vs. outbound traffic. For most community servers, polling every 30–60 seconds is plenty when coupled with `/api/notify` for webhook pushes.
