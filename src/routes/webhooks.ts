import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireApiKey } from "../middleware/requireApiKey.js";

// cspell:ignore treeify

const createSchema = z.object({
  url: z.url(),
  description: z.string().trim().max(255).optional(),
});

export const webhooksRouter = Router();

webhooksRouter.use(requireApiKey);

webhooksRouter.get("/", async (req, res) => {
  const apiKey = req.apiKey;
  const hooks = await prisma.webhook.findMany({
    where: { apiKeyId: apiKey.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, description: true, createdAt: true },
  });
  res.json(hooks);
});

webhooksRouter.post("/", async (req, res) => {
  const apiKey = req.apiKey;
  const parsed = createSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid body", details: z.treeifyError(parsed.error) });
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
    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create webhook", err);
    res.status(500).json({ error: "Failed to create webhook, u have skill issue" });
  }
});

webhooksRouter.delete("/:id", async (req, res) => {
  const apiKey = req.apiKey;
  const id = req.params.id;

  const hook = await prisma.webhook.findUnique({
    where: { id },
    select: { id: true, apiKeyId: true },
  });

  if (!hook || hook.apiKeyId !== apiKey.id) {
    return res.status(404).json({ error: "Webhook not found" });
  }

  try {
    await prisma.webhook.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete webhook", err);
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});
