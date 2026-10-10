import type { ScriptureVerse } from "../components/Scripture";

/** John 3:16–18 (NASB 2020), pre-marked the way a student might in Stage 2. */
export const JOHN_3_16_18: ScriptureVerse[] = [
  {
    number: 16,
    segments: [
      "For ",
      { text: "God", category: "god" },
      " so loved ",
      { text: "the world", category: "people" },
      ", that He gave His only ",
      { text: "Son", category: "jesus" },
      ", so that everyone who ",
      { text: "believes", category: "commands" },
      " in Him will not ",
      { text: "perish", category: "sin" },
      ", ",
      { text: "but", category: "contrast" },
      " have ",
      { text: "eternal life", category: "salvation" },
      ".",
    ],
  },
  {
    number: 17,
    segments: [
      "For ",
      { text: "God", category: "god" },
      " did not send ",
      { text: "the Son", category: "jesus" },
      " ",
      { text: "into the world", category: "location" },
      " to ",
      { text: "judge", category: "sin" },
      " the world, ",
      { text: "but", category: "contrast" },
      " so that the world might be ",
      { text: "saved", category: "salvation" },
      " through Him.",
    ],
  },
  {
    number: 18,
    segments: [
      "The one who ",
      { text: "believes", category: "commands" },
      " in Him is not judged; the one who does not believe has ",
      { text: "already", category: "time" },
      " been ",
      { text: "judged", category: "sin" },
      ", because he has not believed in the name of the only ",
      { text: "Son of God", category: "jesus" },
      ".",
    ],
  },
];

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
