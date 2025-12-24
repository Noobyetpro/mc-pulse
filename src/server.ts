import { app } from "./index.js";
import { config } from "./config.js";
import { disconnectCache, ensureRedis } from "./cache.js";
import { disconnectDatabase } from "./db.js";

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
