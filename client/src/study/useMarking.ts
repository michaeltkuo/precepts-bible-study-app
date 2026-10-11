import { useCallback, useMemo, useState } from "react";
import type { PassageMark } from "../design-system";
import { mergeHighlight, removeHighlightsInRange, resolveKeywordId } from "../hooks/useHighlight";
import { KEY_WORDS, KEY_WORD_BY_ID, type KeyWord } from "../marking/library";
import { findOccurrences, findUnmarkedKeyWords, type Occurrence, type Range } from "../marking/matcher";
import type { HighlightMark } from "../types/study";

const RECENT_KEY = "precepts-recent-keywords";

const readRecent = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string" && KEY_WORD_BY_ID[id]) : [];
  } catch {
    return [];
  }
};

export type LegendEntry = { keyword: KeyWord; count: number };
export type UnmarkedEntry = { keyword: KeyWord; occurrences: Occurrence[] };

/** Marking state and actions for one passage. */
export const useMarking = ({
  text,
  marks,
  onChange,
}: {
  text: string;
  marks: HighlightMark[];
  onChange: (marks: HighlightMark[]) => void;
}) => {
  const [recentIds, setRecentIds] = useState<string[]>(readRecent);

  const remember = useCallback((keywordId: string) => {
    setRecentIds((prev) => {
      const next = [keywordId, ...prev.filter((id) => id !== keywordId)].slice(0, 8);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable; recents last for this visit only.
      }
      return next;
    });
  }, []);

  const passageMarks = useMemo<PassageMark[]>(
    () =>
      marks.flatMap((mark) => {
        const keywordId = resolveKeywordId(mark);
        return keywordId ? [{ id: mark.id, startOffset: mark.startOffset, endOffset: mark.endOffset, keywordId }] : [];
      }),
    [marks],
  );

  const apply = useCallback(
    (keywordId: string, range: Range) => {
      onChange(mergeHighlight(marks, { startOffset: range.start, endOffset: range.end, keywordId }));
      remember(keywordId);
    },
    [marks, onChange, remember],
  );

  /** Mark every occurrence of a key word in the passage. Returns how many were added. */
  const markAll = useCallback(
    (keywordId: string) => {
      const kw = KEY_WORD_BY_ID[keywordId];
      if (!kw) return 0;
      const occurrences = findOccurrences(text, kw).filter(
        (occ) => !passageMarks.some((m) => m.keywordId === keywordId && m.startOffset < occ.end && m.endOffset > occ.start),
      );
      const next = occurrences.reduce(
        (acc, occ) => mergeHighlight(acc, { startOffset: occ.start, endOffset: occ.end, keywordId }),
        marks,
      );
      onChange(next);
      remember(keywordId);
      return occurrences.length;
    },
    [marks, onChange, passageMarks, remember, text],
  );

  const removeInRange = useCallback(
    (range: Range) => onChange(removeHighlightsInRange(marks, range.start, range.end)),
    [marks, onChange],
  );

  const countFor = useCallback((keywordId: string) => {
    const kw = KEY_WORD_BY_ID[keywordId];
    return kw ? findOccurrences(text, kw).length : 0;
  }, [text]);

  /** Key words already marked, in the order they first appear. */
  const legend = useMemo<LegendEntry[]>(() => {
    const byId = new Map<string, { count: number; first: number }>();
    for (const mark of passageMarks) {
      const entry = byId.get(mark.keywordId);
      if (entry) {
        entry.count += 1;
        entry.first = Math.min(entry.first, mark.startOffset);
      } else {
        byId.set(mark.keywordId, { count: 1, first: mark.startOffset });
      }
    }
    return [...byId.entries()]
      .sort((a, b) => a[1].first - b[1].first)
      .map(([id, { count }]) => ({ keyword: KEY_WORD_BY_ID[id], count }));
  }, [passageMarks]);

  /** Library key words in the passage that aren't marked yet, Precept core first. */
  const unmarked = useMemo<UnmarkedEntry[]>(() => {
    if (!text) return [];
    const ranges = passageMarks.map((m) => ({ start: m.startOffset, end: m.endOffset, keywordId: m.keywordId }));
    return findUnmarkedKeyWords(text, KEY_WORDS, ranges).sort(
      (a, b) =>
        Number(b.keyword.source === "precept") - Number(a.keyword.source === "precept") ||
        b.occurrences.length - a.occurrences.length ||
        a.keyword.label.localeCompare(b.keyword.label),
    );
  }, [passageMarks, text]);

  const recent = useMemo(() => recentIds.map((id) => KEY_WORD_BY_ID[id]).filter(Boolean), [recentIds]);

  return { passageMarks, apply, markAll, removeInRange, countFor, legend, unmarked, recent };
};
