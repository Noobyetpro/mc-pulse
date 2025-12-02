---
sidebar_position: 1
---

# mc-pulse

> Official docs and the hosted API run from https://mc-pulse.vercel.app/ (no ports). The content here mirrors the same API surface while walking you through the self-hosted workflow.

mc-pulse is a lightweight Minecraft server status API with webhook fan-out. It can ping **Java** and **Bedrock** servers, cache responses in Redis, persist snapshots in Postgres, and notify your webhooks with the latest status.

## Why mc-pulse?
- One endpoint for both Java and Bedrock pings.
- Redis-backed caching for Java lookups keeps latency low.
- Postgres storage via Prisma tracks server history and webhooks.
- API keys and webhook delivery out of the box; bring your own clients.

## How it works (at a glance)
1. Requests hit `/api/status` (or `/api/status/{type}`) with host/port inputs.
2. Java pings are cached in Redis for `CACHE_TTL_SECONDS`; Bedrock bypasses cache.
3. Each lookup upserts the server record and stores a snapshot in Postgres.
4. `/api/notify` reuses the same status payload and POSTs it to every webhook tied to the provided API key.

## Jump in
- Start with the hosted API walkthrough in [Getting started](./getting-started.md).
- Ready to self-host? Follow the deployment steps in [Deploying on your own](./deployment.md).
- Call the API using the ready-to-copy curl snippets in the [API reference](./api.md).
- Wire up alerts for your community or dashboards with the [webhooks guide](./webhooks.md).

## Docs map
- [Download & install](./download-and-install.md): grab the code, set env vars, and generate Prisma.
- [Getting started](./getting-started.md): quick API and webhook smoke tests.
- [API reference](./api.md) and [webhooks](./webhooks.md): request shapes and delivery flows.
- [Deployment](./deployment.md): production checklists, systemd, Docker, and environment guidance.
