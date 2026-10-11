import type { KeyWord } from "./library";

export type Range = { start: number; end: number };
export type Occurrence = Range & { keywordId: string };

/** Endings a key word may carry and still count: believes, blessed, judging, the Lord's. */
const SUFFIX = "(?:['’]s|s|es|ed|d|ing|eth|est)?";
const LETTER = "[\\p{L}\\p{N}]";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formPattern = (form: string) => {
  const words = form.trim().split(/\s+/).map((word) => escapeRegExp(word).replace(/['’]/g, "['’]"));
  return `${words.join("\\s+")}${SUFFIX}`;
};

/** Every surface form a key word matches: its name, aliases and listed inflections. */
export const formsFor = (kw: KeyWord): string[] => {
  const forms = [...(kw.matchable ? [kw.label] : []), ...kw.aliases, ...kw.forms];
  // Longest first so "word of the Lord" wins over "Lord" inside one alternation.
  return [...new Set(forms)].sort((a, b) => b.length - a.length);
};

const patternCache = new Map<string, RegExp | null>();

const patternFor = (kw: KeyWord): RegExp | null => {
  const cached = patternCache.get(kw.id);
  if (cached !== undefined) return cached;
  const forms = formsFor(kw);
  const pattern =
    forms.length === 0
      ? null
      : new RegExp(`(?<!${LETTER})(?:${forms.map(formPattern).join("|")})(?!${LETTER})`, kw.caseSensitive ? "gu" : "giu");
  patternCache.set(kw.id, pattern);
  return pattern;
};

/** All places a key word appears in the text. */
export const findOccurrences = (text: string, kw: KeyWord): Occurrence[] => {
  const pattern = patternFor(kw);
  if (!pattern) return [];
  pattern.lastIndex = 0;
  const found: Occurrence[] = [];
  for (const match of text.matchAll(pattern)) {
    found.push({ start: match.index, end: match.index + match[0].length, keywordId: kw.id });
  }
  return found;
};

const isWordChar = (ch: string | undefined) => Boolean(ch && /[\p{L}\p{N}'’]/u.test(ch));

/**
 * Widen a rough drag-selection to whole words and drop surrounding spaces and
 * punctuation, so "od so lov" becomes "God so loved".
 */
export const snapToWords = (text: string, start: number, end: number): Range => {
  let s = Math.max(0, Math.min(start, end));
  let e = Math.min(text.length, Math.max(start, end));
  while (s < e && !isWordChar(text[s])) s += 1;
  while (e > s && !isWordChar(text[e - 1])) e -= 1;
  while (s > 0 && isWordChar(text[s - 1])) s -= 1;
  while (e < text.length && isWordChar(text[e])) e += 1;
  // Possessive/closing apostrophes are not part of the word itself.
  while (e > s && /['’]/.test(text[e - 1])) e -= 1;
  return { start: s, end: e };
};

export type Suggestion = {
  keyword: KeyWord;
  /** exact: the selection is this key word; phrase: the selection is part of a key phrase; within: the key word sits inside the selection. */
  kind: "exact" | "phrase" | "within";
  range: Range;
};

const KIND_ORDER: Record<Suggestion["kind"], number> = { exact: 0, phrase: 1, within: 2 };

/** Library key words that fit a selection, best first. */
export const suggestForSelection = (text: string, selection: Range, library: KeyWord[]): Suggestion[] => {
  const snapped = snapToWords(text, selection.start, selection.end);
  if (snapped.end <= snapped.start) return [];
  const suggestions: Suggestion[] = [];

  for (const kw of library) {
    let best: Suggestion | null = null;
    for (const occ of findOccurrences(text, kw)) {
      if (occ.end <= snapped.start || occ.start >= snapped.end) continue;
      const range = { start: occ.start, end: occ.end };
      let kind: Suggestion["kind"];
      if (occ.start === snapped.start && occ.end === snapped.end) kind = "exact";
      else if (occ.start <= snapped.start && occ.end >= snapped.end) kind = "phrase";
      else if (occ.start >= snapped.start && occ.end <= snapped.end) kind = "within";
      else continue;
      if (!best || KIND_ORDER[kind] < KIND_ORDER[best.kind]) best = { keyword: kw, kind, range };
    }
    if (best) suggestions.push(best);
  }

  return suggestions.sort(
    (a, b) =>
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      Number(b.keyword.source === "precept") - Number(a.keyword.source === "precept") ||
      b.range.end - b.range.start - (a.range.end - a.range.start) ||
      a.keyword.label.localeCompare(b.keyword.label),
  );
};

/** Text search over the library by name, alias or note. */
export const searchLibrary = (query: string, library: KeyWord[], limit = 12): KeyWord[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: Array<{ kw: KeyWord; score: number }> = [];
  for (const kw of library) {
    const label = kw.label.toLowerCase();
    const names = [label, ...kw.aliases.map((a) => a.toLowerCase())];
    let score = -1;
    if (label === q) score = 0;
    else if (names.some((n) => n === q)) score = 1;
    else if (label.startsWith(q)) score = 2;
    else if (names.some((n) => n.startsWith(q))) score = 3;
    else if (names.some((n) => n.includes(q)) || kw.note?.toLowerCase().includes(q)) score = 4;
    if (score >= 0) scored.push({ kw, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.kw.label.length - b.kw.label.length)
    .slice(0, limit)
    .map((s) => s.kw);
};

/**
 * Library key words present in the passage that aren't marked yet, with
 * their unmarked occurrences. Drives "also in this passage".
 */
export const findUnmarkedKeyWords = (
  text: string,
  library: KeyWord[],
  marks: Array<Range & { keywordId?: string }>,
): Array<{ keyword: KeyWord; occurrences: Occurrence[] }> => {
  const results: Array<{ keyword: KeyWord; occurrences: Occurrence[] }> = [];
  for (const kw of library) {
    const unmarked = findOccurrences(text, kw).filter(
      (occ) => !marks.some((m) => m.keywordId === kw.id && m.start < occ.end && m.end > occ.start),
    );
    if (unmarked.length > 0) results.push({ keyword: kw, occurrences: unmarked });
  }
  return results;
};
