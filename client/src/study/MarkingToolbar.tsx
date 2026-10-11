import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { cn, Icon, IconButton, Kbd, KeyWordSample } from "../design-system";
import { KEY_WORDS, KEY_WORD_BY_ID, keyWordName, SOURCE_LABEL, type KeyWord } from "../marking/library";
import { searchLibrary, snapToWords, suggestForSelection, type Range } from "../marking/matcher";

/** Marks applied by meaning rather than by matching a word. */
const BY_MEANING = ["geographical-locations", "references-to-time", "comparison", "but", "therefore", "purpose"]
  .map((id) => KEY_WORD_BY_ID[id])
  .filter(Boolean);

type Row = { keyword: KeyWord; range: Range; hint?: string };

type MarkingToolbarProps = {
  text: string;
  selection: Range;
  recent: KeyWord[];
  /** Key words already marked on the selection. */
  existing: KeyWord[];
  countFor: (keywordId: string) => number;
  onApply: (keywordId: string, range: Range) => void;
  onMarkAll: (keywordId: string) => void;
  onRemove: () => void;
  onClose: () => void;
  style?: CSSProperties;
};

/**
 * Popover over a text selection. It suggests the library key words that fit
 * what you selected, lets you search all of them, and can mark every
 * occurrence in the passage at once.
 */
export const MarkingToolbar = ({
  text,
  selection,
  recent,
  existing,
  countFor,
  onApply,
  onMarkAll,
  onRemove,
  onClose,
  style,
}: MarkingToolbarProps) => {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const snapped = useMemo(() => snapToWords(text, selection.start, selection.end), [text, selection]);
  const selected = text.slice(snapped.start, snapped.end);

  const suggestions = useMemo<Row[]>(
    () =>
      suggestForSelection(text, selection, KEY_WORDS)
        .slice(0, 4)
        .map((s) => ({
          keyword: s.keyword,
          range: s.range,
          hint: s.kind === "phrase" ? `Marks “${text.slice(s.range.start, s.range.end)}”` : s.kind === "within" ? `Marks “${text.slice(s.range.start, s.range.end)}” only` : undefined,
        })),
    [selection, text],
  );

  const results = useMemo<Row[]>(
    () => searchLibrary(query, KEY_WORDS, 8).map((keyword) => ({ keyword, range: snapped })),
    [query, snapped],
  );

  const rows = query ? results : suggestions;
  const quickPicks = useMemo(() => {
    const shown = new Set(rows.map((r) => r.keyword.id));
    return [...recent, ...BY_MEANING].filter((kw, i, all) => !shown.has(kw.id) && all.indexOf(kw) === i).slice(0, 8);
  }, [recent, rows]);

  // Typing anywhere while the toolbar is open goes to search; numbers pick a row.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const inSearch = document.activeElement === searchRef.current;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (!inSearch && /^[1-9]$/.test(event.key)) {
        const row = rows[Number(event.key) - 1];
        if (row) {
          event.preventDefault();
          onApply(row.keyword.id, row.range);
        }
        return;
      }
      if (event.key === "Enter" && rows[0] && (inSearch || !(document.activeElement instanceof HTMLButtonElement))) {
        event.preventDefault();
        if (event.shiftKey) onMarkAll(rows[0].keyword.id);
        else onApply(rows[0].keyword.id, rows[0].range);
        return;
      }
      if (!inSearch && event.key.length === 1 && /\S/.test(event.key)) {
        event.preventDefault();
        setQuery((q) => q + event.key);
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onApply, onClose, onMarkAll, rows]);

  return (
    <div
      role="dialog"
      aria-label="Mark selection"
      data-marking-toolbar=""
      className="absolute z-30 flex w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-rule bg-paper-overlay font-ui shadow-float"
      style={style}
    >
      <div className="flex items-center gap-2 border-b border-rule py-1.5 pl-3 pr-1.5">
        <p className="min-w-0 flex-1 truncate text-sm text-ink-muted">
          Mark <span className="font-scripture text-ink">“{selected}”</span>
        </p>
        <IconButton icon="x-lg" label="Close" size="sm" onClick={onClose} />
      </div>

      {existing.length > 0 ? (
        <div className="flex items-center gap-2 border-b border-rule bg-paper-sunken/60 px-3 py-1.5">
          <span className="text-xs text-ink-muted">Marked</span>
          <span className="flex min-w-0 flex-1 flex-wrap gap-x-2">
            {existing.map((kw) => (
              <KeyWordSample key={kw.id} recipe={kw.recipe} text={kw.label} className="text-sm" />
            ))}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 text-xs font-semibold text-danger hover:bg-danger-soft"
          >
            <Icon name="eraser" /> Remove
          </button>
        </div>
      ) : null}

      <div className="px-2 pt-2">
        <label className="relative block">
          <span className="sr-only">Find a key word</span>
          <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a key word…"
            className="h-8 w-full rounded-md border border-rule bg-paper-raised pl-8 pr-2 text-sm text-ink placeholder:text-ink-faint focus:border-ribbon focus:outline-none"
          />
        </label>
      </div>

      <div className="flex max-h-72 flex-col overflow-y-auto px-1 py-1">
        <p className="px-2 pb-0.5 pt-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {query ? "Library" : suggestions.length ? "Suggested" : "No key word matches this selection"}
        </p>
        {rows.map((row, i) => (
          <KeyWordRow
            key={`${row.keyword.id}-${row.range.start}`}
            row={row}
            index={i}
            count={countFor(row.keyword.id)}
            onApply={() => onApply(row.keyword.id, row.range)}
            onMarkAll={() => onMarkAll(row.keyword.id)}
          />
        ))}
        {query && results.length === 0 ? (
          <p className="px-2 py-2 text-sm text-ink-muted">Nothing in the library called “{query}”. Custom marks are coming.</p>
        ) : null}
      </div>

      {quickPicks.length > 0 ? (
        <div className="border-t border-rule px-2 py-2">
          <p className="px-1 pb-1 text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {recent.length ? "Recent and by meaning" : "By meaning"}
          </p>
          <div className="flex flex-wrap gap-1">
            {quickPicks.map((kw) => (
              <button
                key={kw.id}
                type="button"
                onClick={() => onApply(kw.id, snapped)}
                title={`Mark as ${keyWordName(kw)}`}
                className="cursor-pointer rounded-md border border-transparent px-1.5 hover:border-rule hover:bg-paper-raised"
              >
                <KeyWordSample recipe={kw.recipe} text={kw.label} className="text-sm" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule bg-paper-sunken/50 px-3 py-1.5 text-2xs text-ink-faint">
        <span><Kbd>1</Kbd>–<Kbd>4</Kbd> mark</span>
        <span><Kbd>⇧</Kbd><Kbd>↵</Kbd> mark all</span>
        <span>type to search</span>
      </p>
    </div>
  );
};

const KeyWordRow = ({
  row,
  index,
  count,
  onApply,
  onMarkAll,
}: {
  row: Row;
  index: number;
  count: number;
  onApply: () => void;
  onMarkAll: () => void;
}) => {
  const { keyword } = row;
  return (
    <div className="group flex items-center gap-2 rounded-md px-1.5 hover:bg-paper-sunken">
      <button type="button" onClick={onApply} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1 text-left">
        {index < 9 ? <Kbd>{index + 1}</Kbd> : <span className="w-5" />}
        <span className="flex min-w-0 flex-col">
          <span className="flex items-baseline gap-1.5">
            <KeyWordSample recipe={keyword.recipe} text={keyword.label} className="text-base" />
            {keyword.note ? <span className="truncate text-xs text-ink-muted">{keyword.note}</span> : null}
          </span>
          <span className={cn("truncate text-2xs", keyword.source === "precept" ? "text-gilt" : "text-ink-faint")}>
            {row.hint ?? (keyword.aliases.length ? `also ${keyword.aliases.slice(0, 3).join(", ")}` : SOURCE_LABEL[keyword.source])}
          </span>
        </span>
      </button>
      {count > 1 ? (
        <button
          type="button"
          onClick={onMarkAll}
          title={`Mark all ${count} in this passage`}
          className="shrink-0 cursor-pointer rounded-sm px-1.5 py-1 text-xs font-semibold text-ribbon hover:bg-ribbon-soft"
        >
          All {count}
        </button>
      ) : null}
    </div>
  );
};
