import { describe, expect, it } from "vitest";
import { mergeHighlight } from "./useHighlight";

describe("mergeHighlight", () => {
  it("merges overlapping marks for same category", () => {
    const merged = mergeHighlight(
      [{ id: "a", startOffset: 2, endOffset: 6, category: "god", visualStyle: "highlight-yellow" }],
      { startOffset: 4, endOffset: 10, category: "god", visualStyle: "highlight-yellow" }
    );

    expect(merged).toHaveLength(1);
    expect(merged[0].startOffset).toBe(2);
    expect(merged[0].endOffset).toBe(10);
  });

  it("keeps separate marks for different categories", () => {
    const merged = mergeHighlight(
      [{ id: "a", startOffset: 2, endOffset: 6, category: "god", visualStyle: "highlight-yellow" }],
      { startOffset: 4, endOffset: 10, category: "time", visualStyle: "highlight-yellow" }
    );

    expect(merged).toHaveLength(2);
  });

  it("keeps separate marks for different visual styles", () => {
    const merged = mergeHighlight(
      [{ id: "a", startOffset: 2, endOffset: 6, category: "god", visualStyle: "highlight-yellow" }],
      { startOffset: 4, endOffset: 10, category: "god", visualStyle: "underline" }
    );

    expect(merged).toHaveLength(2);
  });
});
