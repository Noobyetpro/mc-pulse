import { config } from "../config.js";
import { redis } from "../cache.js";
import { prisma } from "../db.js";
import { pingJava } from "./java.js";
import { pingBedrock } from "./bedrock.js";

export type ServerType = "java" | "bedrock";

export type ServerStatusResponse = {
  host: string;
  port: number;
  type: ServerType;
  online: boolean;
  latencyMs: number | null;
  playersOnline: number | null;
  playersMax: number | null;
  version: string | null;
  motd: string | null;
  checkedAt: string;
};

function buildCacheKey(host: string, port: number, type: ServerType) {
  return `server_status:${type}:${host}:${port}`;
}

async function cacheStatus(key: string, payload: ServerStatusResponse) {
  try {
    await redis.set(key, JSON.stringify(payload), "EX", config.cacheTtlSeconds);
  } catch (err) {
    console.warn("Cache write failed; continuing without cache.", err);
  }
}

async function persistSnapshot(serverId: string, payload: ServerStatusResponse) {
  await prisma.statusSnapshot.create({
    data: {
      serverId,
      online: payload.online,
      latencyMs: payload.latencyMs,
      playersOnline: payload.playersOnline,
      playersMax: payload.playersMax,
      version: payload.version,
      motd: payload.motd,
    },
  });
}

async function upsertServer(host: string, port: number, motd?: string | null) {
  return prisma.server.upsert({
    where: { host_port: { host, port } },
    update: { name: motd ?? null },
    create: { host, port, name: motd ?? null },
  });
}

export async function fetchServerStatus(
  hostInput: string | undefined,
  portInput: number | undefined,
  type: ServerType,
): Promise<ServerStatusResponse> {
  const host = hostInput || config.defaultServerHost;
  const port = portInput ?? (type === "bedrock" ? 19132 : config.defaultServerPort);
  const cacheKey = buildCacheKey(host, port, type);

  if (type !== "bedrock") {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as ServerStatusResponse;
      }
    } catch (err) {
      console.warn("Cache read failed; continuing without cache.", err);
    }
  }

  const ping =
    type === "bedrock"
      ? await pingBedrock(host, port)
      : await pingJava(host, port);

  const payload: ServerStatusResponse = {
    host,
    port,
    type,
    online: ping.online,
    latencyMs: ping.latency ?? null,
    playersOnline: ping.players?.online ?? null,
    playersMax: ping.players?.max ?? null,
    version: ping.version ?? null,
    motd: ping.motd ?? null,
    checkedAt: new Date().toISOString(),
  };

  if (type !== "bedrock") {
    await cacheStatus(cacheKey, payload);
  }

  const server = await upsertServer(host, port, payload.motd);
  await persistSnapshot(server.id, payload);

  return payload;
}
