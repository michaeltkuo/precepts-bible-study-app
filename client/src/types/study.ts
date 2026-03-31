export type StageId = 1 | 2 | 3 | 4 | 5 | 6;

export type SessionSummary = {
  id: number;
  title: string;
  passageRef: string;
  createdAt: string;
  stageCompleted: StageId;
};

export type MarkCategory =
  | "god"
  | "jesus"
  | "holySpirit"
  | "people"
  | "sin"
  | "salvation"
  | "commands"
  | "location"
  | "time"
  | "contrast";

export type HighlightMark = {
  id: string;
  startOffset: number;
  endOffset: number;
  category: MarkCategory;
  visualStyle?: HighlightVisualStyle;
  styleOnly?: boolean;
  note?: string;
  verseRef?: string;
};

export type HighlightVisualStyle =
  | "highlight-yellow"
  | "highlight-blue"
  | "highlight-green"
  | "highlight-orange"
  | "highlight-pink"
  | "highlight-purple"
  | "highlight-red"
  | "highlight-brown"
  | "highlight-gray"
  | "underline"
  | "double-underline"
  | "wavy-underline"
  | "strike"
  | "bold"
  | "all-caps"
  | "box"
  | "double-box"
  | "brackets"
  | "left-bar"
  | "left-pointer"
  | "inline-pointers"
  | "exclamation"
  | "question"
  | "shadow";
