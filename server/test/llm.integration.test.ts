import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { AppDatabase } from "../src/db/db.js";

describe("llm guide api", () => {
  it("strips think tags from ollama response", async () => {
    const dbFile = path.join(os.tmpdir(), `precepts-llm-${Date.now()}.db`);
    const db = new AppDatabase(dbFile);

    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          message: {
            content: "<think>hidden reasoning</think>Here are your observation prompts.",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    });

    const { app } = createApp({ db, fetchImpl });

    const res = await request(app).post("/api/llm-guide").send({
      stage: 4,
      passageRef: "JHN.3.16-21",
      passageText: "For God so loved the world...",
      highlights: [{ phrase: "God", category: "God/Father", verseRef: "v.16" }],
      stageNotes: [{ stage: 1, content: "first read" }],
      denomination: "non-denominational",
    });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe("Here are your observation prompts.");
  });
});
