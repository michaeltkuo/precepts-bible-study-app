import { describe, expect, it } from "vitest";
import { buildStagePrompt } from "../src/lib/promptBuilder.js";
import { stripThinkTags } from "../src/lib/llm.js";

describe("prompt builder", () => {
  it("serializes highlight and stage notes deterministically", () => {
    const prompt = buildStagePrompt({
      passageRef: "JHN.3.16-21",
      bibleAbbrev: "NASB2020",
      passageText: "For God so loved the world...",
      stage: 4,
      highlights: [
        { phrase: "God", category: "God/Father", verseRef: "v.16" },
        { phrase: "eternal life", category: "Salvation/Promise", verseRef: "v.16" },
      ],
      stageNotes: [{ stage: 1, content: "First read observations" }],
    });

    expect(prompt).toContain("[PASSAGE]");
    expect(prompt).toContain('"God" [God/Father] at v.16');
    expect(prompt).toContain("Stage 1: First read observations");
    expect(prompt).toContain("You are now at Stage 4");
  });
});

describe("think tag stripping", () => {
  it("removes hidden reasoning blocks", () => {
    const content = "<think>internal chain</think>Visible answer";
    expect(stripThinkTags(content)).toBe("Visible answer");
  });
});
