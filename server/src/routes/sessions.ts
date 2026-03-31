import { Router } from "express";
import { z } from "zod";
import { AppDatabase } from "../db/db.js";

const createSessionSchema = z.object({
  passageRef: z.string().min(3),
  bibleId: z.number().int().positive(),
  title: z.string().min(1),
  passageText: z.string().min(1),
  stageCompleted: z.number().int().min(1).max(6).optional(),
});

const updateSessionSchema = z.object({
  title: z.string().min(1).optional(),
  stageCompleted: z.number().int().min(1).max(6).optional(),
});

export const createSessionRouter = (db: AppDatabase) => {
  const router = Router();

  router.get("/sessions", (_req, res) => {
    res.json({ sessions: db.listSessions() });
  });

  router.get("/sessions/:id", (req, res) => {
    const id = Number(req.params.id);
    const session = db.getSessionById(id);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ session });
  });

  router.post("/sessions", (req, res) => {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }

    const session = db.createSession(parsed.data);
    res.status(201).json({ session });
  });

  router.patch("/sessions/:id", (req, res) => {
    const id = Number(req.params.id);
    const parsed = updateSessionSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
      return;
    }

    const session = db.updateSession(id, parsed.data);

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json({ session });
  });

  router.delete("/sessions/:id", (req, res) => {
    const id = Number(req.params.id);
    const deleted = db.deleteSession(id);

    if (!deleted) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.status(204).send();
  });

  return router;
};
