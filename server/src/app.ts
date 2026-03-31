import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { AppDatabase } from "./db/db.js";
import { createBibleRouter } from "./routes/bible.js";
import { createLlmRouter } from "./routes/llm.js";
import { createSessionRouter } from "./routes/sessions.js";
import type { FetchLike } from "./types.js";

export const createApp = (deps?: {
  db?: AppDatabase;
  fetchImpl?: FetchLike;
}) => {
  const db = deps?.db ?? new AppDatabase();
  const fetchImpl = deps?.fetchImpl ?? (globalThis.fetch as FetchLike);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/api",
    createBibleRouter({
      db,
      fetchImpl,
      youVersionApiKey: config.youVersionApiKey,
      youVersionBaseUrl: config.youVersionBaseUrl,
    })
  );
  app.use("/api", createSessionRouter(db));
  app.use(
    "/api",
    createLlmRouter({
      fetchImpl,
      ollamaBaseUrl: config.ollamaBaseUrl,
      ollamaModel: config.ollamaModel,
    })
  );

  return { app, db };
};
