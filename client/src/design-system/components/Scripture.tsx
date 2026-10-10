import type { MarkCategory } from "../../types/study";
import { cn } from "../cn";
import { Mark } from "./Marks";

export type ScriptureSegment = string | { text: string; category: MarkCategory };
export type ScriptureVerse = { number: number; segments: ScriptureSegment[] };

type ScripturePassageProps = {
  reference: string;
  translation: string;
  verses: ScriptureVerse[];
  /** When set, marks outside this category fade so one theme can be traced. */
  focusCategory?: MarkCategory | null;
  className?: string;
};

/**
 * The passage as a page of a study Bible: reading face, generous leading,
 * verse numbers as small gilt superscripts, room above lines for mark symbols.
 */
export const ScripturePassage = ({ reference, translation, verses, focusCategory, className }: ScripturePassageProps) => (
  <article className={cn("mx-auto max-w-[38rem]", className)} aria-label={`${reference} (${translation})`}>
    <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
      <h2 className="font-display text-2xl font-medium text-ink">{reference}</h2>
      <span className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{translation}</span>
    </header>
    <p className="font-scripture text-scripture text-ink [text-wrap:pretty]">
      {verses.map((verse) => (
        <span key={verse.number}>
          <sup className="mr-1 ml-0.5 align-super font-ui text-[0.6em] font-bold text-gilt select-none">{verse.number}</sup>
          {verse.segments.map((segment, i) =>
            typeof segment === "string" ? (
              <span key={i}>{segment}</span>
            ) : (
              <Mark key={i} category={segment.category} dimmed={Boolean(focusCategory) && focusCategory !== segment.category}>
                {segment.text}
              </Mark>
            ),
          )}{" "}
        </span>
      ))}
    </p>
  </article>
);
