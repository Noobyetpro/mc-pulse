import cors from "cors";
import express from "express";
import { statusRouter } from "../src/routes/status.js";
import { apiKeysRouter } from "../src/routes/apiKeys.js";
import { webhooksRouter } from "../src/routes/webhooks.js";

// Minimal Express app for the Vercel serverless function
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", statusRouter);
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/webhooks", webhooksRouter);

export default app;
