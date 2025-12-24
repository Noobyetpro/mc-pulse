import { Elysia } from "elysia";
import { prisma } from "../db.js";
import type { ApiKey } from "../generated/prisma/client.js";

function extractKey(headers: Headers): string | null {
  const headerKey = headers.get("x-api-key");
  if (headerKey) return headerKey.trim();

  const auth = headers.get("authorization");
  if (!auth) return null;

  const [scheme, value] = auth.split(" ");
  if (!scheme || !value) return null;
  if (scheme.toLowerCase() === "apikey") return value.trim();
  return null;
}

export const apiKeyPlugin = <T extends Elysia>(app: T) =>
  app
    .decorate({
      apiKey: undefined as ApiKey | undefined,
      apiKeyError: undefined as { error: string } | undefined,
    })
    .derive(async ({ request, set }) => {
      const key = extractKey(request.headers);
      if (!key) {
        set.status = 401;
        return { apiKey: undefined, apiKeyError: { error: "API key required" } };
      }

      try {
        const record = await prisma.apiKey.findFirst({
          where: { key, revoked: false },
        });
        if (!record) {
          set.status = 401;
          return { apiKey: undefined, apiKeyError: { error: "Invalid API key" } };
        }
        return { apiKey: record as ApiKey, apiKeyError: undefined };
      } catch (err) {
        console.error("API key lookup failed", err);
        set.status = 500;
        return { apiKey: undefined, apiKeyError: { error: "Auth failed" } };
      }
    })
    .onBeforeHandle(({ apiKeyError }) => {
      if (apiKeyError) return apiKeyError;
    });
