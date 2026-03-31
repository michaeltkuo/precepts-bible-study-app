import { useState } from "react";
import type { HighlightMark } from "../types/study";

type LlmRequest = {
  stage: number;
  passageRef: string;
  passageText: string;
  highlights: HighlightMark[];
  stageNotes: Array<{ stage: number; content: string }>;
  denomination: string;
};

export const useLLM = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const requestGuidance = async (input: LlmRequest) => {
    setLoading(true);
    try {
      const payload = {
        stage: input.stage,
        passageRef: input.passageRef,
        bibleAbbrev: "NASB2020",
        passageText: input.passageText,
        highlights: input.highlights
          .filter((item) => !item.styleOnly)
          .map((item) => ({
            phrase: input.passageText.slice(item.startOffset, item.endOffset),
            category: item.category,
            verseRef: item.verseRef,
          })),
        stageNotes: input.stageNotes,
        denomination: input.denomination,
      };

      const res = await fetch("/api/llm-guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Unable to fetch guidance from local model.");
      }

      const data = (await res.json()) as { content: string };
      setResponse(data.content);
      return data.content;
    } finally {
      setLoading(false);
    }
  };

  return { loading, response, requestGuidance };
};
