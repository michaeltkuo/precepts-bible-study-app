import { create } from "zustand";
import type { HighlightMark, SessionSummary, StageId } from "../types/study";

type StudyState = {
  sessions: SessionSummary[];
  activeSessionId: number | null;
  passageText: string;
  passageRef: string;
  bibleId: number;
  currentStage: StageId;
  highlights: HighlightMark[];
  staleStages: StageId[];
  setSessions: (sessions: SessionSummary[]) => void;
  setActiveSessionId: (id: number | null) => void;
  setPassage: (passageRef: string, passageText: string, bibleId: number) => void;
  setCurrentStage: (stage: StageId) => void;
  setHighlights: (highlights: HighlightMark[]) => void;
  markStagesStaleAfter: (stage: StageId) => void;
  clearStaleStage: (stage: StageId) => void;
  clearAllStaleStages: () => void;
};

const stageOrder: StageId[] = [1, 2, 3, 4, 5, 6];

export const useStudyStore = create<StudyState>((set) => ({
  sessions: [],
  activeSessionId: null,
  passageText: "",
  passageRef: "JHN.3.16-21",
  bibleId: 2692,
  currentStage: 1,
  highlights: [],
  staleStages: [],
  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setPassage: (passageRef, passageText, bibleId) => set({ passageRef, passageText, bibleId }),
  setCurrentStage: (currentStage) => set({ currentStage }),
  setHighlights: (highlights) => set({ highlights }),
  markStagesStaleAfter: (stage) =>
    set({
      staleStages: stageOrder.filter((candidate) => candidate > stage),
    }),
  clearStaleStage: (stage) =>
    set((state) => ({
      staleStages: state.staleStages.filter((candidate) => candidate !== stage),
    })),
  clearAllStaleStages: () => set({ staleStages: [] }),
}));
