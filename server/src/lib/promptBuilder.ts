type HighlightInput = {
  phrase: string;
  category: string;
  verseRef?: string;
};

type BuildStagePromptInput = {
  passageRef: string;
  bibleAbbrev: string;
  passageText: string;
  stage: number;
  highlights: HighlightInput[];
  stageNotes: Array<{ stage: number; content: string }>;
};

const STAGE_TASK: Record<number, string> = {
  1: "Provide brief opening guidance for first-read observation without interpretation.",
  2: "Guide the user to mark key words and themes found in this exact passage text. Suggest concrete words/phrases to consider marking.",
  3: "Ask specific observation questions based on what the user already highlighted.",
  4: "Suggest 3-4 specific cross-reference verses that may relate to this passage, with one concise reason each.",
  5: "Ask contextual interpretation questions based on the passage plus the user's highlights and notes so far.",
  6: "Ask contextual application questions based on the passage text and the user's notes so far.",
};

export const buildStagePrompt = (input: BuildStagePromptInput): string => {
  const highlights =
    input.highlights.length === 0
      ? "- None yet"
      : input.highlights
          .map((item) => `- \"${item.phrase}\" [${item.category}]${item.verseRef ? ` at ${item.verseRef}` : ""}`)
          .join("\n");

  const notes =
    input.stageNotes.length === 0
      ? "- None yet"
      : input.stageNotes.map((note) => `Stage ${note.stage}: ${note.content}`).join("\n");

  const currentTask =
    STAGE_TASK[input.stage] ??
    "Ask concise, observation-first questions grounded in the passage and provided notes.";

  return `[PASSAGE]\n${input.bibleAbbrev} — ${input.passageRef}\n${input.passageText}\n\n[USER HIGHLIGHTS]\n${highlights}\n\n[STAGE NOTES]\n${notes}\n\n[CURRENT TASK]\nYou are now at Stage ${input.stage}. ${currentTask}\nKeep output concise: 3-5 bullet points.`;
};
