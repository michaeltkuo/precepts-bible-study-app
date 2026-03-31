const LONG_CHAPTER_CAPS: Record<string, Record<number, number>> = {
  PSA: {
    119: 176,
  },
};

export type ParsedPassage = {
  normalized: string;
  warning?: string;
};

const normalize = (input: string): string => input.trim().toUpperCase().replace(/\s+/g, "");

const formatRangeWarning = (normalized: string): string =>
  `Precepts studies work best on one chapter at a time. Your range has been trimmed to ${normalized}.`;

export const parseUsfmReference = (raw: string): ParsedPassage => {
  const input = normalize(raw);

  const chapterMatch = input.match(/^([1-3]?[A-Z]{2,4})\.(\d+)$/);
  if (chapterMatch) {
    const [, book, chapterStr] = chapterMatch;
    const chapter = Number(chapterStr);
    const maxVerses = LONG_CHAPTER_CAPS[book]?.[chapter];

    if (maxVerses && maxVerses > 50) {
      return {
        normalized: `${book}.${chapter}.1-50`,
        warning:
          "This chapter is very long. To keep your study focused, only the first 50 verses are loaded.",
      };
    }

    return { normalized: `${book}.${chapter}` };
  }

  const verseMatch = input.match(/^([1-3]?[A-Z]{2,4})\.(\d+)\.(\d+)$/);
  if (verseMatch) {
    const [, book, chapter, verse] = verseMatch;
    return { normalized: `${book}.${Number(chapter)}.${Number(verse)}` };
  }

  const sameChapterRange = input.match(/^([1-3]?[A-Z]{2,4})\.(\d+)\.(\d+)-(\d+)$/);
  if (sameChapterRange) {
    const [, book, chapterStr, startStr, endStr] = sameChapterRange;
    const chapter = Number(chapterStr);
    const start = Number(startStr);
    const end = Number(endStr);

    if (end < start) {
      throw new Error("Ending verse must be greater than or equal to starting verse.");
    }

    const span = end - start + 1;
    if (span > 50) {
      return {
        normalized: `${book}.${chapter}.${start}-${start + 49}`,
        warning:
          "This range is very long. To keep your study focused, only 50 verses are loaded.",
      };
    }

    return { normalized: `${book}.${chapter}.${start}-${end}` };
  }

  const multiChapterRange = input.match(/^([1-3]?[A-Z]{2,4})\.(\d+)\.(\d+)-([1-3]?[A-Z]{2,4})?\.?((\d+))\.(\d+)$/);
  if (multiChapterRange) {
    const [, startBook, startChapter] = multiChapterRange;
    const normalized = `${startBook}.${Number(startChapter)}`;
    return {
      normalized,
      warning: formatRangeWarning(normalized),
    };
  }

  throw new Error("Use USFM format like JHN.3.16, JHN.3.16-21, or ROM.8.");
};
