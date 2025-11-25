import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  port: z.coerce.number().int().positive().default(3000),
  databaseUrl: z.url(),
  redisUrl: z.url(),
  cacheTtlSeconds: z.coerce.number().int().positive().default(30),
  defaultServerHost: z.string().default("localhost"),
  defaultServerPort: z.coerce.number().int().positive().default(25565),
});

const parsed = configSchema.parse({
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  cacheTtlSeconds: process.env.CACHE_TTL_SECONDS,
  defaultServerHost: process.env.DEFAULT_SERVER_HOST,
  defaultServerPort: process.env.DEFAULT_SERVER_PORT,
});

export const config = {
  port: parsed.port,
  databaseUrl: parsed.databaseUrl,
  redisUrl: parsed.redisUrl,
  cacheTtlSeconds: parsed.cacheTtlSeconds,
  defaultServerHost: parsed.defaultServerHost,
  defaultServerPort: parsed.defaultServerPort,
};
