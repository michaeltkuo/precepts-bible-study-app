import { useCallback } from "react";
import { useStudyStore } from "../store/useStudyStore";
import type { SessionSummary } from "../types/study";

type SessionApiSession = {
  id: number;
  title: string;
  passage_ref: string;
  created_at: string;
  stage_completed: number;
};

const toSessionSummary = (session: SessionApiSession): SessionSummary => ({
  id: session.id,
  title: session.title,
  passageRef: session.passage_ref,
  createdAt: session.created_at,
  stageCompleted: Math.min(Math.max(session.stage_completed, 1), 6) as SessionSummary["stageCompleted"],
});

export const useSession = () => {
  const sessions = useStudyStore((state) => state.sessions);
  const setSessions = useStudyStore((state) => state.setSessions);

  const loadSessions = useCallback(async () => {
    const response = await fetch("/api/sessions");
    if (!response.ok) {
      throw new Error("Failed to load sessions.");
    }

    const payload = (await response.json()) as { sessions: SessionApiSession[] };
    setSessions(payload.sessions.map(toSessionSummary));
  }, [setSessions]);

  const deleteSession = useCallback(async (id: number) => {
    const response = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to delete session.");
    }

    setSessions(sessions.filter((session) => session.id !== id));
  }, [sessions, setSessions]);

  return { sessions, loadSessions, deleteSession };
};
