import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { config } from "./config.js";
import { statusRoutes } from "./routes/status.js";
import { apiKeysRoutes } from "./routes/apiKeys.js";
import { webhooksRoutes } from "./routes/webhooks.js";
import { disconnectCache, ensureRedis } from "./cache.js";
import { disconnectDatabase } from "./db.js";

const app = new Elysia();

app.use(cors());

app.get("/health", () => ({ ok: true }));

app.group("/api", (app) =>
  app
    .use(statusRoutes)
    .group("/api-keys", (group) => group.use(apiKeysRoutes))
    .group("/webhooks", (group) => group.use(webhooksRoutes)),
);

async function start() {
  try {
    await ensureRedis();
  } catch {
    // continue startup even if redis is unavailable
  }

  const server = app.listen(config.port);
  console.log(`mc-pulse API listening on port ${config.port}`);

  async function shutdown() {
    server.stop();
    await Promise.allSettled([disconnectCache(), disconnectDatabase()]);
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (import.meta.main) {
  start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
}

export default app.fetch;
