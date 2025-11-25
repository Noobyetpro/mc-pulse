import Redis from "ioredis";
import { config } from "./config.js";

export const redis = new Redis(config.redisUrl);

redis.on("error", (err) => {
  console.error("Redis connection error", err);
});

export async function disconnectCache() {
  await redis.quit();
}

export async function ensureRedis() {
  try {
    const pong = await redis.ping();
    console.log(`Redis ready (ping: ${pong})`);
  } catch (err) {
    console.warn("Redis is not ready, continuing without cache.", err);
    throw err;
  }
}
