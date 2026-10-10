import type { PassageMark } from "../components/Scripture";
import { JOHN_3_16_18 } from "../../study/samplePassage";

export { JOHN_3_16_18 };

/** Marks a student might add in Stage 2, as [phrase, key word id, which occurrence]. */
const MARKED: Array<[string, string, number?]> = [
  ["God", "god", 0],
  ["loved", "love"],
  ["world", "world", 0],
  ["believes", "believe", 0],
  ["perish", "perish"],
  ["but", "but", 0],
  ["eternal life", "eternal-life"],
  ["God", "god", 1],
  ["world", "world", 1],
  ["judge", "judge", 0],
  ["world", "world", 2],
  ["but", "but", 1],
  ["world", "world", 3],
  ["saved", "salvation"],
  ["believes", "believe", 1],
  ["judged", "judge", 0],
  ["already", "references-to-time"],
  ["judged", "judge", 1],
  ["God", "god", 2],
];

const nthIndex = (text: string, phrase: string, n: number) => {
  let index = -1;
  for (let i = 0; i <= n; i += 1) {
    index = text.indexOf(phrase, index + 1);
    while (index >= 0 && /\w/.test(text[index - 1] ?? "") ) index = text.indexOf(phrase, index + 1);
  }
  return index;
};

export const JOHN_MARKS: PassageMark[] = MARKED.map(([phrase, keywordId, n = 0], i) => {
  const start = nthIndex(JOHN_3_16_18, phrase, n);
  return { id: `s${i}`, startOffset: start, endOffset: start + phrase.length, keywordId };
});

export const SAMPLE_QUESTIONS = [
  "What does verse 16 say God did because He loved the world?",
  "You marked “but” twice. What two outcomes does each one set against each other?",
  "Who is judged in verse 18, and when does the text say that happens?",
];

export const SAMPLE_SESSIONS = [
  { title: "God's Love and Judgment", reference: "John 3:16–21", stage: 2 },
  { title: "Justified by Faith", reference: "Romans 5:1–11", stage: 6 },
  { title: "The Shepherd's Care", reference: "Psalm 23", stage: 4 },
  { title: "Abide in the Vine", reference: "John 15:1–11", stage: 1 },
];
