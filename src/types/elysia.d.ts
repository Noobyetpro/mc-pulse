import type { ApiKey } from "../generated/prisma/client.js";

declare module "elysia" {
  interface Context {
    apiKey?: ApiKey;
    apiKeyError?: { error: string };
  }
}
