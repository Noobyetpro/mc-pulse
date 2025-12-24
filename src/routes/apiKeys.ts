import { randomBytes } from "node:crypto";
import { Elysia } from "elysia";
import { z } from "zod";
import { prisma } from "../db.js";

const createSchema = z.object({
  label: z.string().trim().min(1).max(120).optional(),
});

export const apiKeysRoutes = new Elysia({ name: "apiKeys" });

// cspell:ignore treeify
apiKeysRoutes.post("/", async ({ body, set }) => {
  const parsed = createSchema.safeParse(body ?? {});
  if (!parsed.success) {
    set.status = 400;
    return { error: "Invalid body", details: z.treeifyError(parsed.error) };
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
    set.status = 201;
    return created;
  } catch (err) {
    console.error("Failed to create API key", err);
    set.status = 500;
    return { error: "Failed to create API key" };
  }
});
