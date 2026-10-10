import { useState } from "react";
import { cn, Eyebrow, KeyWordSample } from "../design-system";
import { keyWordName } from "../marking/library";
import type { LegendEntry, UnmarkedEntry } from "./useMarking";

type KeyWordLegendProps = {
  legend: LegendEntry[];
  unmarked: UnmarkedEntry[];
  focusId: string | null;
  onFocus: (keywordId: string | null) => void;
  onMarkAll: (keywordId: string) => void;
};

const COLLAPSED = 6;

/**
 * Under the passage: the key words you've marked (tap one to trace it) and
 * library key words that appear in the passage but aren't marked yet.
 */
export const KeyWordLegend = ({ legend, unmarked, focusId, onFocus, onMarkAll }: KeyWordLegendProps) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? unmarked : unmarked.slice(0, COLLAPSED);

  return (
    <div className="flex flex-col gap-6 font-ui">
      {legend.length > 0 ? (
        <section aria-label="Key words in this passage" className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <Eyebrow>Key words in this passage</Eyebrow>
            {focusId ? (
              <button type="button" className="cursor-pointer text-xs font-semibold text-ribbon" onClick={() => onFocus(null)}>
                Show all marks
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {legend.map(({ keyword, count }) => (
              <button
                key={keyword.id}
                type="button"
                aria-pressed={focusId === keyword.id}
                onClick={() => onFocus(focusId === keyword.id ? null : keyword.id)}
                title={`Trace ${keyWordName(keyword)} through the passage`}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 transition-colors",
                  focusId === keyword.id ? "border-ink bg-paper-overlay" : "border-rule bg-paper-raised hover:border-rule-strong",
                )}
              >
                <KeyWordSample recipe={keyword.recipe} text={keyword.label} className="text-sm" />
                <span className="text-xs tabular-nums text-ink-faint">{count}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {unmarked.length > 0 ? (
        <section aria-label="Also in this passage" className="flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <Eyebrow>Also in this passage</Eyebrow>
            <p className="text-sm text-ink-muted">Library key words you haven't marked yet. Precept core words come first.</p>
          </div>
          <ul className="grid gap-x-4 sm:grid-cols-2">
            {visible.map(({ keyword, occurrences }) => (
              <li key={keyword.id} className="flex items-center gap-2 border-b border-rule py-0.5">
                <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                  <KeyWordSample recipe={keyword.recipe} text={keyword.label} className="text-base" />
                  {keyword.note ? <span className="truncate text-xs text-ink-muted">{keyword.note}</span> : null}
                </span>
                <span className="text-xs tabular-nums text-ink-faint">{occurrences.length}×</span>
                <button
                  type="button"
                  onClick={() => onMarkAll(keyword.id)}
                  className="cursor-pointer rounded-sm px-1.5 py-1 text-xs font-semibold text-ribbon hover:bg-ribbon-soft"
                >
                  Mark all
                </button>
              </li>
            ))}
          </ul>
          {unmarked.length > COLLAPSED ? (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="cursor-pointer self-start text-sm font-semibold text-ink-muted hover:text-ink"
            >
              {expanded ? "Show fewer" : `Show ${unmarked.length - COLLAPSED} more`}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};
