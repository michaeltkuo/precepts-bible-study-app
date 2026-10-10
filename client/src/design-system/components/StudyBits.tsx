import type { ReactNode } from "react";
import { cn } from "../cn";
import { Icon } from "./Icon";

type GuidanceBlock = { kind: "list"; items: string[] } | { kind: "text"; text: string };

/** Split model output into paragraphs and bullet/numbered lists. */
const parseGuidance = (content: string): GuidanceBlock[] => {
  const blocks: GuidanceBlock[] = [];
  for (const raw of content.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    const clean = (bullet ? bullet[1] : line).replace(/\*\*(.+?)\*\*/g, "$1");
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.kind === "list") last.items.push(clean);
      else blocks.push({ kind: "list", items: [clean] });
    } else {
      blocks.push({ kind: "text", text: clean });
    }
  }
  return blocks;
};

export type GuidanceStatus = "ready" | "thinking" | "stale" | "offline" | "idle";

/**
 * The AI facilitator's questions. Set in the reading face with a gilt rule so
 * it reads as margin notes from a study leader rather than a chat bubble.
 */
export const GuidanceCard = ({
  status = "ready",
  questions,
  content,
  idleText = "Questions for this stage appear here.",
  onRegenerate,
}: {
  status?: GuidanceStatus;
  questions?: string[];
  content?: string;
  idleText?: string;
  onRegenerate?: () => void;
}) => {
  const blocks: GuidanceBlock[] = questions ? [{ kind: "list", items: questions }] : content ? parseGuidance(content) : [];
  return (
    <section aria-label="Study guide questions" className="rounded-md border-l-2 border-gilt bg-gilt-soft/45 py-3.5 pl-4 pr-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-[0.12em] text-gilt">
          <Icon name="feather" /> Study guide
        </p>
        {status === "thinking" ? (
          <span className="flex items-center gap-1.5 font-ui text-xs text-ink-muted" role="status">
            <span className="size-1.5 animate-pulse rounded-full bg-gilt" /> Thinking…
          </span>
        ) : (status === "stale" || status === "offline" || (status === "ready" && blocks.length > 0)) && onRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-0.5 font-ui text-xs font-semibold",
              status === "ready" ? "text-ink-faint hover:bg-paper-sunken hover:text-ink" : "text-warn hover:bg-warn-soft",
            )}
          >
            <Icon name="arrow-clockwise" /> {status === "offline" ? "Try again" : status === "stale" ? "Refresh questions" : "New questions"}
          </button>
        ) : null}
      </div>
      {status === "offline" ? (
        <p className="font-ui text-sm text-ink-muted">The study guide can't reach Ollama. Check that it's running, then try again.</p>
      ) : blocks.length === 0 ? (
        <p className="font-ui text-sm text-ink-muted">{status === "thinking" ? "Reading the passage and your marks…" : idleText}</p>
      ) : (
        <div className={cn("flex flex-col gap-2 font-scripture text-base leading-7 text-ink", status === "thinking" && "opacity-50")}>
          {blocks.map((block, i) =>
            block.kind === "list" ? (
              <ol key={i} className="flex list-decimal flex-col gap-2 pl-5 marker:font-ui marker:text-sm marker:text-gilt">
                {block.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            ) : (
              <p key={i}>{block.text}</p>
            ),
          )}
        </div>
      )}
      <p className="mt-3 font-ui text-xs text-ink-faint">
        AI questions can carry denominational assumptions. Test them against the text.
      </p>
    </section>
  );
};

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
