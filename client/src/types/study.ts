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

/**
 * A marked span of the passage. `keywordId` points into the key-word library.
 * Marks saved before the library existed carry only a legacy `category`,
 * which resolveKeywordId() maps onto a library key word.
 */
export type HighlightMark = {
  id: string;
  startOffset: number;
  endOffset: number;
  keywordId?: string;
  /** @deprecated Legacy ten-category marks. */
  category?: MarkCategory;
  note?: string;
  verseRef?: string;
};
