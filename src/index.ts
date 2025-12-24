import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { statusRoutes } from "./routes/status.js";
import { apiKeysRoutes } from "./routes/apiKeys.js";
import { webhooksRoutes } from "./routes/webhooks.js";

export const app = new Elysia();

app.use(cors());

app.get("/favicon.ico", ({ set }) => {
  set.status = 204;
  return;
});

app.get("/health", () => ({ ok: true }));

app.group("/api", (app) =>
  app
    .use(statusRoutes)
    .group("/api-keys", (group) => group.use(apiKeysRoutes))
    .group("/webhooks", (group) => group.use(webhooksRoutes)),
);

export default app.fetch;
