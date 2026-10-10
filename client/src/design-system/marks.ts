import type { MarkCategory } from "../types/study";

export type MarkDefinition = {
  category: MarkCategory;
  label: string;
  symbol: string;
  /** What to look for when marking, in workbook language. */
  hint: string;
  /** Washed highlight, or an underline for places and times. */
  treatment: "wash" | "underline";
};

/**
 * The single source of truth for Precepts key-word marking.
 * Colours live in styles.css as --mark-{token} / --mark-{token}-ink.
 */
export const MARKS: MarkDefinition[] = [
  { category: "god", label: "God", symbol: "△", hint: "God the Father, His names and pronouns", treatment: "wash" },
  { category: "jesus", label: "Jesus", symbol: "✝", hint: "Jesus, the Son, the Messiah", treatment: "wash" },
  { category: "holySpirit", label: "Holy Spirit", symbol: "☁", hint: "The Spirit and His work", treatment: "wash" },
  { category: "people", label: "People", symbol: "✎", hint: "Groups and individuals: Israel, the world, disciples", treatment: "wash" },
  { category: "sin", label: "Sin", symbol: "✗", hint: "Sin, evil, judgment, darkness", treatment: "wash" },
  { category: "salvation", label: "Salvation", symbol: "★", hint: "Salvation, promises, eternal life", treatment: "wash" },
  { category: "commands", label: "Commands", symbol: "→", hint: "Instructions to obey", treatment: "wash" },
  { category: "location", label: "Location", symbol: "⌖", hint: "Places and geography", treatment: "underline" },
  { category: "time", label: "Time", symbol: "◷", hint: "When things happen: then, after, on that day", treatment: "underline" },
  { category: "contrast", label: "Contrast", symbol: "↔", hint: "But, yet, however, therefore", treatment: "wash" },
];

export const MARK_BY_CATEGORY: Record<MarkCategory, MarkDefinition> = Object.fromEntries(
  MARKS.map((mark) => [mark.category, mark]),
) as Record<MarkCategory, MarkDefinition>;
