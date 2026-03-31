import { Router } from "express";
import { z } from "zod";
import type { FetchLike } from "../types.js";
import { buildStagePrompt } from "../lib/promptBuilder.js";
import { stripThinkTags } from "../lib/llm.js";

const requestSchema = z.object({
  stage: z.number().int().min(1).max(6),
  passageRef: z.string().min(3),
  bibleAbbrev: z.string().min(1).default("NASB2020"),
  passageText: z.string().min(1),
  highlights: z
    .array(
      z.object({
        phrase: z.string().min(1),
        category: z.string().min(1),
        verseRef: z.string().optional(),
      })
    )
    .default([]),
  stageNotes: z
    .array(
      z.object({
        stage: z.number().int().min(1).max(6),
        content: z.string(),
      })
    )
    .default([]),
  denomination: z.string().default("non-denominational"),
});

export const createLlmRouter = (deps: {
  fetchImpl: FetchLike;
  ollamaBaseUrl: string;
  ollamaModel: string;
}) => {
  const router = Router();

  router.post("/llm-guide", async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }

    const prompt = buildStagePrompt(parsed.data);
    const systemPrompt = `You are a ${parsed.data.denomination} inductive Bible study facilitator. Ask observation-first questions and avoid theological conclusions.`;

    const upstream = await deps.fetchImpl(`${deps.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: deps.ollamaModel,
        stream: false,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "Failed to call Ollama" });
      return;
    }

    const payload = (await upstream.json()) as { message?: { content?: string } };
    const rawContent = payload.message?.content ?? "";
    const content = stripThinkTags(rawContent);

    res.json({ prompt, content });
  });

  return router;
};
