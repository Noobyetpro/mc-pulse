import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { statusRouter } from "./routes/status.js";
import { apiKeysRouter } from "./routes/apiKeys.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { disconnectCache, ensureRedis } from "./cache.js";
import { disconnectDatabase } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", statusRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/webhooks", webhooksRouter);

async function start() {
  try {
    await ensureRedis();
  } catch {
    // continue startup even if redis is unavailable
  }

  const server = app.listen(config.port, () => {
    console.log(`mc-pulse API listening on port ${config.port}`);
  });

  async function shutdown() {
    server.close();
    await Promise.allSettled([disconnectCache(), disconnectDatabase()]);
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
