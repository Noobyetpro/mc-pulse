import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

const createSchema = z.object({
  label: z.string().trim().min(1).max(120).optional(),
});

export const apiKeysRouter = Router();

// cspell:ignore treeify
apiKeysRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid body", details: z.treeifyError(parsed.error) });
  }

  const key = `key_${randomBytes(24).toString("hex")}`;

  try {
    const created = await prisma.apiKey.create({
      data: {
        key,
        label: parsed.data.label ?? null,
      },
      select: { id: true, key: true, label: true, createdAt: true },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Failed to create API key", err);
    res.status(500).json({ error: "Failed to create API key" });
  }
});
