import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db.js";
import type { ApiKey } from "../generated/prisma/client.js";

function extractKey(req: Request): string | null {
  const headerKey = req.header("x-api-key");
  if (headerKey) return headerKey.trim();

  const auth = req.header("authorization");
  if (!auth) return null;

  const [scheme, value] = auth.split(" ");
  if (!scheme || !value) return null;
  if (scheme.toLowerCase() === "apikey") return value.trim();
  return null;
}

export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = extractKey(req);
  if (!key) {
    return res.status(401).json({ error: "API key required" });
  }

  try {
    const record = await prisma.apiKey.findFirst({
      where: { key, revoked: false },
    });
    if (!record) {
      return res.status(401).json({ error: "Invalid API key" });
    }
    req.apiKey = record;
    next();
  } catch (err) {
    console.error("API key lookup failed", err);
    res.status(500).json({ error: "Auth failed" });
  }
}
