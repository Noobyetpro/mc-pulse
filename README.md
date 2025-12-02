# mc-pulse

[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](#) [![Docs](https://img.shields.io/badge/docs-Docusaurus-blue)](docs/)

mc-pulse is a lightweight HTTP service that pings Minecraft servers (Java + Bedrock), caches Java results in Redis, stores snapshots in Postgres, and can fan-out status payloads to your webhooks with API-key protection.

## What it does
- Check Java or Bedrock status with optional host/port overrides.
- Redis-backed cache for Java responses (configurable TTL).
- Postgres stores servers and historical snapshots via Prisma.
- API-key protected webhooks; one call notifies every hook for that key.
- `/health` endpoint to confirm the process is up.

## Docs
- Official docs and endpoints are hosted at https://mc-pulse.vercel.app/ (no ports); visit that deployment for the canonical experience and live API surface.
- The `docs-live` directory in this repo holds the Docusaurus source for the self-hosted guides—download/install instructions, API and webhook reference, and the deploy-on-your-own playbook.

## Quick smoke test
Once the server is running: `curl http://localhost:${PORT:-3000}/health` → `{ "ok": true }`.

## Notes
- Java responses use Redis caching; Bedrock requests always hit the server live.
- Prisma client is generated from `prisma/schema.prisma`; regenerate after schema changes.
- Keep `.env` and API keys out of version control.
