import type { StageId } from "../types/study";

/** The six inductive stages: short label for the path, full title for headings. */
export const STAGES: Array<{ id: StageId; short: string; title: string }> = [
  { id: 1, short: "Read", title: "Prayer, Intent & First Read" },
  { id: 2, short: "Mark", title: "Mark Key Words & Themes" },
  { id: 3, short: "Ask", title: "5 W's & H" },
  { id: 4, short: "Context", title: "Context & Cross-References" },
  { id: 5, short: "Interpret", title: "Interpretation" },
  { id: 6, short: "Apply", title: "Application" },
];
