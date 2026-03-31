import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { AppDatabase } from "../src/db/db.js";

describe("verse api", () => {
  it("proxies to YouVersion then caches response", async () => {
    const dbFile = path.join(os.tmpdir(), `precepts-verse-${Date.now()}.db`);
    const db = new AppDatabase(dbFile);

    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          data: {
            content: "For God so loved the world",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    });

    const { app } = createApp({ db, fetchImpl });

    const first = await request(app)
      .get("/api/verse")
      .query({ bibleId: "2692", usfm: "JHN.3.16" });

    expect(first.status).toBe(200);
    expect(first.body.fromCache).toBe(false);
    expect(first.body.text).toContain("For God so loved");
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const second = await request(app)
      .get("/api/verse")
      .query({ bibleId: "2692", usfm: "JHN.3.16" });

    expect(second.status).toBe(200);
    expect(second.body.fromCache).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    db.close();
    fs.rmSync(dbFile, { force: true });
  });
});
