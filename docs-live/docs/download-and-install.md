---
sidebar_position: 1
---

# Download & install

Get mc-pulse onto your machine before running locally or deploying.

## Grab the source
- **Git clone (recommended):**
  ```bash
  git clone https://github.com/Noobyetpro/mc-pulse.git
  cd mc-pulse
  ```
- **Download ZIP:** use the “Download ZIP” button on GitHub, then extract and open the folder in your terminal.

> The docs site lives under `docs/`, while the API code lives at the repo root (`src/`, `prisma/`).

## Install prerequisites
- Node.js **18+** (ESM project).  
- Postgres: reachable from where you run mc-pulse.  
- Redis: used for Java cache; service will still start without it.

## Install dependencies
From the project root:
```bash
npm install
```

Generate the Prisma client:
```bash
npx prisma generate
```

## Configure environment
Copy and fill in `.env`:
```bash
cp .env.example .env
```

Set at least:
- `DATABASE_URL` (mc_pulse schema is used automatically)
- `REDIS_URL`
- Optionally override `PORT`, `DEFAULT_SERVER_HOST`, `DEFAULT_SERVER_PORT`, `CACHE_TTL_SECONDS`

## Prepare the database
Run migrations locally:
```bash
npx prisma migrate dev
```

> For production, use `npx prisma migrate deploy` instead of `dev`.

## Smoke test
Start the API in watch mode:
```bash
npm run dev
```

Verify it’s alive:
```bash
curl http://localhost:${PORT:-3000}/health
```

Next: follow [Getting started](./getting-started.md) for quick API calls and webhook tests.
