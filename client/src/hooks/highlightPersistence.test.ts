import { beforeEach, describe, expect, it } from "vitest";
import { clearHighlightCache, loadHighlights, saveHighlights } from "./highlightPersistence";

describe("highlight persistence", () => {
  beforeEach(() => {
    clearHighlightCache();
  });

  it("saves and reloads offsets without mutation", () => {
    const marks = [
      { id: "h1", startOffset: 5, endOffset: 15, category: "god" as const },
      { id: "h2", startOffset: 30, endOffset: 36, category: "time" as const },
    ];

    saveHighlights(7, marks);
    const reloaded = loadHighlights(7);

    expect(reloaded).toEqual(marks);
    expect(reloaded[0].startOffset).toBe(5);
    expect(reloaded[0].endOffset).toBe(15);
  });
});
