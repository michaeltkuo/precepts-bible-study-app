import type { ReactNode } from "react";
import type { MarkCategory } from "../../types/study";
import { cn } from "../cn";
import { MARKS } from "../marks";
import { Icon } from "./Icon";
import { MarkSwatch } from "./Marks";

/**
 * The AI facilitator's questions. Set in the reading face with a gilt rule so
 * it reads as margin notes from a study leader rather than a chat bubble.
 */
export const GuidanceCard = ({
  status = "ready",
  questions,
  onRegenerate,
}: {
  status?: "ready" | "thinking" | "stale" | "offline";
  questions: string[];
  onRegenerate?: () => void;
}) => (
  <section aria-label="Study guide questions" className="rounded-md border-l-2 border-gilt bg-gilt-soft/45 py-3.5 pl-4 pr-3">
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-gilt">
        <Icon name="feather" /> Study guide
      </p>
      {status === "thinking" ? (
        <span className="flex items-center gap-1.5 font-ui text-xs text-ink-muted">
          <span className="size-1.5 animate-pulse rounded-full bg-gilt" /> Thinking…
        </span>
      ) : status === "stale" || status === "offline" ? (
        <button
          type="button"
          onClick={onRegenerate}
          className="flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-0.5 font-ui text-xs font-semibold text-warn hover:bg-warn-soft"
        >
          <Icon name="arrow-clockwise" /> {status === "stale" ? "Refresh questions" : "Try again"}
        </button>
      ) : null}
    </div>
    {status === "offline" ? (
      <p className="font-ui text-sm text-ink-muted">The study guide can't reach Ollama. Check that it's running, then try again.</p>
    ) : (
      <ol className={cn("flex list-decimal flex-col gap-2 pl-5 font-scripture text-base leading-7 text-ink marker:font-ui marker:text-sm marker:text-gilt", status === "thinking" && "opacity-50")}>
        {questions.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ol>
    )}
    <p className="mt-3 font-ui text-xs text-ink-faint">
      AI questions can carry denominational assumptions. Test them against the text.
    </p>
  </section>
);

/** One row in the study history list. */
export const SessionItem = ({
  title,
  reference,
  stage,
  active,
  onClick,
}: {
  title: string;
  reference: string;
  stage: number;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={cn(
      "group flex w-full cursor-pointer flex-col gap-0.5 rounded-md px-3 py-2 text-left transition-colors",
      active ? "bg-paper-raised shadow-page" : "hover:bg-paper-raised/60",
    )}
  >
    <span className="flex items-center gap-2">
      {active ? <span aria-hidden className="h-4 w-0.5 rounded-full bg-ribbon" /> : null}
      <span className="truncate font-display text-base font-medium text-ink">{title}</span>
    </span>
    <span className="flex items-center gap-2 font-ui text-xs text-ink-muted">
      <span>{reference}</span>
      <span aria-hidden>·</span>
      <span>{stage === 6 ? "Complete" : `Stage ${stage} of 6`}</span>
    </span>
  </button>
);

/**
 * Floating palette that appears over a text selection. Ten Precepts marks,
 * plus clear and note. Keys 1–0 map to the marks in order.
 */
export const SelectionToolbar = ({
  onMark,
  onClear,
  onNote,
  className,
}: {
  onMark?: (category: MarkCategory) => void;
  onClear?: () => void;
  onNote?: () => void;
  className?: string;
}) => (
  <div
    role="toolbar"
    aria-label="Mark selection"
    className={cn("inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-rule bg-paper-overlay p-1 shadow-float", className)}
  >
    {MARKS.map((mark, i) => (
      <button
        key={mark.category}
        type="button"
        onClick={() => onMark?.(mark.category)}
        title={`${mark.label} (${(i + 1) % 10})`}
        aria-label={`Mark as ${mark.label}`}
        className="grid size-9 cursor-pointer place-items-center rounded-md hover:bg-paper-sunken"
      >
        <MarkSwatch category={mark.category} />
      </button>
    ))}
    <span aria-hidden className="mx-1 h-6 w-px bg-rule" />
    <ToolbarButton icon="chat-square-text" label="Add note" onClick={onNote} />
    <ToolbarButton icon="eraser" label="Clear marks" onClick={onClear} />
  </div>
);

const ToolbarButton = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    aria-label={label}
    className="grid size-9 cursor-pointer place-items-center rounded-md text-ink-muted hover:bg-paper-sunken hover:text-ink"
  >
    <Icon name={icon} />
  </button>
);

/** Segmented control for a small set of exclusive options. */
export const Segmented = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; icon?: string }>;
  onChange: (value: T) => void;
}) => (
  <div role="radiogroup" aria-label={label} className="inline-flex rounded-md border border-rule bg-paper-sunken p-0.5">
    {options.map((option) => {
      const checked = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={checked}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-sm px-2.5 font-ui text-sm font-semibold transition-colors",
            checked ? "bg-paper-raised text-ink shadow-page" : "text-ink-muted hover:text-ink",
          )}
        >
          {option.icon ? <Icon name={option.icon} /> : null}
          {option.label}
        </button>
      );
    })}
  </div>
);

/** Keyboard key hint. */
export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-grid h-5 min-w-5 place-items-center rounded-xs border border-b-2 border-rule-strong bg-paper-raised px-1 font-ui text-2xs font-semibold text-ink-muted">
    {children}
  </kbd>
);
