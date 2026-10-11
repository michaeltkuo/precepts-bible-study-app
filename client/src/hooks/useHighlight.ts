import { KEY_WORD_BY_ID, LEGACY_CATEGORY_TO_KEYWORD } from "../marking/library";
import type { HighlightMark } from "../types/study";

export const markId = () => `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

/** The library key word a mark draws with, including marks saved under the old categories. */
export const resolveKeywordId = (mark: HighlightMark): string | undefined => {
  const id = mark.keywordId ?? (mark.category ? LEGACY_CATEGORY_TO_KEYWORD[mark.category] : undefined);
  return id && KEY_WORD_BY_ID[id] ? id : undefined;
};

/**
 * Add a mark, merging it with touching or overlapping marks of the same key
 * word so dragging across "eternal" then "life" yields one "eternal life".
 */
export const mergeHighlight = (marks: HighlightMark[], next: Omit<HighlightMark, "id">): HighlightMark[] => {
  const keywordId = next.keywordId;
  const overlaps = marks.filter(
    (mark) =>
      resolveKeywordId(mark) === keywordId &&
      !(next.endOffset < mark.startOffset || next.startOffset > mark.endOffset),
  );

  if (overlaps.length === 0) {
    return [...marks, { id: markId(), ...next }];
  }

  const remaining = marks.filter((mark) => !overlaps.includes(mark));
  return [
    ...remaining,
    {
      id: markId(),
      ...next,
      startOffset: Math.min(next.startOffset, ...overlaps.map((mark) => mark.startOffset)),
      endOffset: Math.max(next.endOffset, ...overlaps.map((mark) => mark.endOffset)),
    },
  ];
};

/** Remove every mark that overlaps a range. */
export const removeHighlightsInRange = (marks: HighlightMark[], start: number, end: number) =>
  marks.filter((mark) => end <= mark.startOffset || start >= mark.endOffset);
