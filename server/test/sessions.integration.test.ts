import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { AppDatabase } from "../src/db/db.js";

describe("sessions api", () => {
  it("creates and lists sessions", async () => {
    const dbFile = path.join(os.tmpdir(), `precepts-sessions-${Date.now()}.db`);
    const db = new AppDatabase(dbFile);
    const { app } = createApp({ db, fetchImpl: fetch });

    const createRes = await request(app).post("/api/sessions").send({
      passageRef: "JHN.3.16-21",
      bibleId: 2692,
      title: "God's Love and Judgment",
      passageText: "For God so loved the world...",
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.session.id).toBeTypeOf("number");

    const listRes = await request(app).get("/api/sessions");
    expect(listRes.status).toBe(200);
    expect(listRes.body.sessions).toHaveLength(1);
    expect(listRes.body.sessions[0].title).toBe("God's Love and Judgment");

    const patchRes = await request(app)
      .patch(`/api/sessions/${createRes.body.session.id}`)
      .send({ stageCompleted: 3 });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.session.stage_completed).toBe(3);

    const deleteRes = await request(app).delete(`/api/sessions/${createRes.body.session.id}`);
    expect(deleteRes.status).toBe(204);

    const listAfterDelete = await request(app).get("/api/sessions");
    expect(listAfterDelete.status).toBe(200);
    expect(listAfterDelete.body.sessions).toHaveLength(0);

    db.close();
    fs.rmSync(dbFile, { force: true });
  });
});
