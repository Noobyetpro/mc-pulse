import { Elysia } from "elysia";
import { z } from "zod";
import { prisma } from "../db.js";
import { apiKeyPlugin } from "../middleware/requireApiKey.js";

// cspell:ignore treeify

const createSchema = z.object({
  url: z.url(),
  description: z.string().trim().max(255).optional(),
});

export const webhooksRoutes = apiKeyPlugin(new Elysia({ name: "webhooks" }));

webhooksRoutes.get("/", async ({ apiKey, set }) => {
  if (!apiKey) {
    set.status = 401;
    return { error: "API key required" };
  }
  const hooks = await prisma.webhook.findMany({
    where: { apiKeyId: apiKey.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, description: true, createdAt: true },
  });
  return hooks;
});

webhooksRoutes.post("/", async ({ apiKey, body, set }) => {
  if (!apiKey) {
    set.status = 401;
    return { error: "API key required" };
  }
  const parsed = createSchema.safeParse(body ?? {});
  if (!parsed.success) {
    set.status = 400;
    return { error: "Invalid body", details: z.treeifyError(parsed.error) };
  }

  try {
    const created = await prisma.webhook.create({
      data: {
        apiKeyId: apiKey.id,
        url: parsed.data.url,
        description: parsed.data.description ?? null,
      },
      select: { id: true, url: true, description: true, createdAt: true },
    });
    set.status = 201;
    return created;
  } catch (err) {
    console.error("Failed to create webhook", err);
    set.status = 500;
    return { error: "Failed to create webhook, u have skill issue" };
  }
});

webhooksRoutes.delete("/:id", async ({ apiKey, params, set }) => {
  if (!apiKey) {
    set.status = 401;
    return { error: "API key required" };
  }
  const id = params.id;

  const hook = await prisma.webhook.findUnique({
    where: { id },
    select: { id: true, apiKeyId: true },
  });

  if (!hook || hook.apiKeyId !== apiKey.id) {
    set.status = 404;
    return { error: "Webhook not found" };
  }

  try {
    await prisma.webhook.delete({ where: { id } });
    set.status = 204;
    return;
  } catch (err) {
    console.error("Failed to delete webhook", err);
    set.status = 500;
    return { error: "Failed to delete webhook" };
  }
});
