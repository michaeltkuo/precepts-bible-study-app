import { describe, expect, it } from "vitest";
import { mergeHighlight, removeHighlightsInRange, resolveKeywordId } from "./useHighlight";

describe("mergeHighlight", () => {
  it("merges overlapping marks for the same key word", () => {
    const merged = mergeHighlight([{ id: "a", startOffset: 2, endOffset: 6, keywordId: "god" }], {
      startOffset: 4,
      endOffset: 10,
      keywordId: "god",
    });

    expect(merged).toHaveLength(1);
    expect(merged[0].startOffset).toBe(2);
    expect(merged[0].endOffset).toBe(10);
  });

  it("keeps separate marks for different key words", () => {
    const merged = mergeHighlight([{ id: "a", startOffset: 2, endOffset: 6, keywordId: "god" }], {
      startOffset: 4,
      endOffset: 10,
      keywordId: "references-to-time",
    });

    expect(merged).toHaveLength(2);
  });

  it("treats a legacy category mark as its library key word", () => {
    const merged = mergeHighlight([{ id: "a", startOffset: 2, endOffset: 6, category: "god" }], {
      startOffset: 6,
      endOffset: 9,
      keywordId: "god",
    });

    expect(merged).toHaveLength(1);
  });
});

describe("resolveKeywordId", () => {
  it("maps old categories and ignores unknown ids", () => {
    expect(resolveKeywordId({ id: "a", startOffset: 0, endOffset: 1, category: "jesus" })).toBe("jesus-christ");
    expect(resolveKeywordId({ id: "b", startOffset: 0, endOffset: 1, keywordId: "nope" })).toBeUndefined();
  });
});

describe("removeHighlightsInRange", () => {
  it("drops only marks that overlap the range", () => {
    const marks = [
      { id: "a", startOffset: 0, endOffset: 3, keywordId: "god" },
      { id: "b", startOffset: 10, endOffset: 14, keywordId: "love" },
    ];
    expect(removeHighlightsInRange(marks, 2, 5).map((m) => m.id)).toEqual(["b"]);
  });
});
