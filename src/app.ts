import cors from "cors";
import express from "express";
import { statusRouter } from "./routes/status.js";
import { apiKeysRouter } from "./routes/apiKeys.js";
import { webhooksRouter } from "./routes/webhooks.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", statusRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/webhooks", webhooksRouter);

export { app };
