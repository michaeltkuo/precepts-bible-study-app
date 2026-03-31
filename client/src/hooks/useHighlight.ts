import { useCallback } from "react";
import type { HighlightMark, HighlightVisualStyle, MarkCategory } from "../types/study";

const markId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

export const mergeHighlight = (
  marks: HighlightMark[],
  next: Omit<HighlightMark, "id">
): HighlightMark[] => {
  const sameCategory = marks.filter(
    (mark) =>
      mark.category === next.category &&
      (mark.visualStyle ?? "highlight-yellow") === (next.visualStyle ?? "highlight-yellow") &&
      Boolean(mark.styleOnly) === Boolean(next.styleOnly)
  );
  const overlaps = sameCategory.filter(
    (mark) => !(next.endOffset < mark.startOffset || next.startOffset > mark.endOffset)
  );

  if (overlaps.length === 0) {
    return [...marks, { id: markId(), ...next }];
  }

  const mergedStart = Math.min(next.startOffset, ...overlaps.map((mark) => mark.startOffset));
  const mergedEnd = Math.max(next.endOffset, ...overlaps.map((mark) => mark.endOffset));

  const remaining = marks.filter((mark) => !overlaps.some((overlap) => overlap.id === mark.id));

  return [
    ...remaining,
    {
      id: markId(),
      ...next,
      startOffset: mergedStart,
      endOffset: mergedEnd,
    },
  ];
};

export const useHighlight = (
  marks: HighlightMark[],
  setMarks: (marks: HighlightMark[]) => void
) => {
  const addHighlight = useCallback(
    (
      startOffset: number,
      endOffset: number,
      category: MarkCategory,
      visualStyle: HighlightVisualStyle = "highlight-yellow",
      options?: { styleOnly?: boolean }
    ) => {
      if (startOffset === endOffset) {
        return;
      }

      const normalizedStart = Math.min(startOffset, endOffset);
      const normalizedEnd = Math.max(startOffset, endOffset);

      const next = mergeHighlight(marks, {
        startOffset: normalizedStart,
        endOffset: normalizedEnd,
        category,
        visualStyle,
        styleOnly: Boolean(options?.styleOnly),
      });

      setMarks(next);
    },
    [marks, setMarks]
  );

  return { addHighlight };
};
