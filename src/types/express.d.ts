import type { ApiKey } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface Request {
      apiKey: ApiKey;
    }
  }
}

export {};
