import { Router } from "express";
import { z } from "zod";
import { fetchServerStatus } from "../services/statusService.js";
import { requireApiKey } from "../middleware/requireApiKey.js";
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

export const statusRouter = Router();

statusRouter.get("/status", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: z.treeifyError(parsed.error),
    });
  }

  try {
    const data = await fetchServerStatus(
      parsed.data.host,
      parsed.data.port,
      parsed.data.type,
    );
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch server status", err);
    res.status(500).json({ error: "Failed to fetch server status" });
  }
});

statusRouter.get("/status/:type", async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: z.treeifyError(parsed.error),
    });
  }

  try {
    if (req.params.type !== "java" && req.params.type !== "bedrock") {
      return res.status(400).json({ error: "Invalid server type" });
    }

    const data = await fetchServerStatus(
      parsed.data.host,
      parsed.data.port,
      req.params.type as "java" | "bedrock",
    );
    res.json(data);
  } catch (err) {
    console.error("Failed to fetch server status", err);
    res.status(500).json({ error: "Failed to fetch server status" });
  }
});

statusRouter.post("/notify", requireApiKey, async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: z.treeifyError(parsed.error),
    });
  }

  const apiKey = req.apiKey;

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

    res.json({
      status,
      deliveries: deliveries.map((d, idx) =>
        d.status === "fulfilled"
          ? d.value
          : { id: hooks[idx]?.id, url: hooks[idx]?.url, ok: false, error: String(d.reason) },
      ),
    });
  } catch (err) {
    console.error("Failed to notify webhooks", err);
    res.status(500).json({ error: "Failed to notify webhooks" });
  }
});

// Legacy/alias path to support /api/status/notify
statusRouter.post("/status/notify", requireApiKey, async (req, res) => {
  const parsed = querySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: z.treeifyError(parsed.error),
    });
  }

  const apiKey = req.apiKey;

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

    res.json({
      status,
      deliveries: deliveries.map((d, idx) =>
        d.status === "fulfilled"
          ? d.value
          : { id: hooks[idx]?.id, url: hooks[idx]?.url, ok: false, error: String(d.reason) },
      ),
    });
  } catch (err) {
    console.error("Failed to notify webhooks", err);
    res.status(500).json({ error: "Failed to notify webhooks" });
  }
});
