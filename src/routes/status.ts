import { Elysia, type StatusMap } from "elysia";
import { z } from "zod";
import { fetchServerStatus } from "../services/statusService.js";
import { apiKeyPlugin } from "../middleware/requireApiKey.js";
import { prisma } from "../db.js";

// cspell:ignore treeify

const querySchema = z.object({
  host: z.string().trim().min(1).optional(),
  port: z.preprocess(
    (val) => {
      if (val === undefined || val === "") return undefined;
      if (typeof val === "string") return Number(val);
      return val;
    },
    z.number().int().positive().optional(),
  ),
  type: z
    .enum(["java", "bedrock"])
    .optional()
    .default("java"),
});

async function handleNotify({
  query,
  apiKey,
  set,
}: {
  query: Record<string, string>;
  apiKey: { id: string } | undefined;
  set: { status?: number | keyof StatusMap };
}) {
  const parsed = querySchema.safeParse(query);

  if (!parsed.success) {
    set.status = 400;
    return {
      error: "Invalid query parameters",
      details: z.treeifyError(parsed.error),
    };
  }

  if (!apiKey) {
    set.status = 401;
    return { error: "API key required" };
  }

  try {
    const status = await fetchServerStatus(
      parsed.data.host,
      parsed.data.port,
      parsed.data.type,
    );

    const hooks = await prisma.webhook.findMany({
      where: { apiKeyId: apiKey.id },
      select: { id: true, url: true },
    });

    const deliveries = await Promise.allSettled(
      hooks.map(async (hook) => {
        const resp = await fetch(hook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(status),
        });
        return {
          id: hook.id,
          url: hook.url,
          ok: resp.ok,
          status: resp.status,
        };
      }),
    );

    return {
      status,
      deliveries: deliveries.map((d, idx) =>
        d.status === "fulfilled"
          ? d.value
          : { id: hooks[idx]?.id, url: hooks[idx]?.url, ok: false, error: String(d.reason) },
      ),
    };
  } catch (err) {
    console.error("Failed to notify webhooks", err);
    set.status = 500;
    return { error: "Failed to notify webhooks" };
  }
}

const notifyRoutes = apiKeyPlugin(new Elysia({ name: "notify" }))
  .post("/notify", ({ query, apiKey, set }) =>
    handleNotify({ query, apiKey, set }),
  )
  // Legacy/alias path to support /api/status/notify
  .post("/status/notify", ({ query, apiKey, set }) =>
    handleNotify({ query, apiKey, set }),
  );

export const statusRoutes = new Elysia({ name: "status" })
  .get("/status", async ({ query, set }) => {
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      set.status = 400;
      return {
        error: "Invalid query parameters",
        details: z.treeifyError(parsed.error),
      };
    }

    try {
      const data = await fetchServerStatus(
        parsed.data.host,
        parsed.data.port,
        parsed.data.type,
      );
      return data;
    } catch (err) {
      console.error("Failed to fetch server status", err);
      set.status = 500;
      return { error: "Failed to fetch server status" };
    }
  })
  .get("/status/:type", async ({ query, params, set }) => {
    const parsed = querySchema.safeParse(query);

    if (!parsed.success) {
      set.status = 400;
      return {
        error: "Invalid query parameters",
        details: z.treeifyError(parsed.error),
      };
    }

    try {
      if (params.type !== "java" && params.type !== "bedrock") {
        set.status = 400;
        return { error: "Invalid server type" };
      }

      const data = await fetchServerStatus(
        parsed.data.host,
        parsed.data.port,
        params.type as "java" | "bedrock",
      );
      return data;
    } catch (err) {
      console.error("Failed to fetch server status", err);
      set.status = 500;
      return { error: "Failed to fetch server status" };
    }
  })
  .use(notifyRoutes);
