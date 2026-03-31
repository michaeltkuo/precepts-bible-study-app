import { Router } from "express";
import { z } from "zod";
import { AppDatabase } from "../db/db.js";
import type { FetchLike } from "../types.js";

const requestSchema = z.object({
  bibleId: z.coerce.number().int().positive(),
  usfm: z.string().min(3),
});

const extractPassageText = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const maybePayload = payload as Record<string, unknown>;
  const data = maybePayload.data as Record<string, unknown> | undefined;

  if (typeof data?.content === "string") {
    return data.content;
  }

  if (typeof maybePayload.content === "string") {
    return maybePayload.content;
  }

  return "";
};

export const createBibleRouter = (deps: {
  db: AppDatabase;
  fetchImpl: FetchLike;
  youVersionApiKey: string;
  youVersionBaseUrl: string;
}) => {
  const router = Router();

  router.get("/verse", async (req, res) => {
    const parsed = requestSchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query params", details: parsed.error.flatten() });
      return;
    }

    const { bibleId, usfm } = parsed.data;
    const cached = deps.db.getCachedPassage(bibleId, usfm);

    if (cached) {
      res.json({
        bibleId,
        usfm,
        text: cached.text,
        fromCache: true,
      });
      return;
    }

    const upstreamUrl = `${deps.youVersionBaseUrl}/v1/bibles/${bibleId}/passages/${encodeURIComponent(usfm)}`;
    const upstreamRes = await deps.fetchImpl(upstreamUrl, {
      headers: {
        "x-yvp-app-key": deps.youVersionApiKey,
        accept: "application/json",
      },
    });

    if (!upstreamRes.ok) {
      res.status(upstreamRes.status).json({ error: "Failed to fetch passage from YouVersion" });
      return;
    }

    const payload = (await upstreamRes.json()) as unknown;
    const text = extractPassageText(payload);

    deps.db.cachePassage(bibleId, usfm, text, JSON.stringify(payload));

    res.json({ bibleId, usfm, text, fromCache: false });
  });

  return router;
};
