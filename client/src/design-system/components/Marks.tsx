import type { ReactNode } from "react";
import type { MarkCategory } from "../../types/study";
import { cn } from "../cn";
import { MARK_BY_CATEGORY } from "../marks";

/** A span of scripture marked with a Precepts category. */
export const Mark = ({
  category,
  dimmed = false,
  showSymbol = true,
  children,
}: {
  category: MarkCategory;
  dimmed?: boolean;
  showSymbol?: boolean;
  children: ReactNode;
}) => {
  const def = MARK_BY_CATEGORY[category];
  return (
    <span
      className={cn("mark", `mark-${category}`, dimmed && "is-dimmed")}
      data-symbol={showSymbol ? def.symbol : undefined}
      title={def.label}
    >
      {children}
    </span>
  );
};

/** Swatch showing a category's symbol and colour, as used in legends and the toolbar. */
export const MarkSwatch = ({ category, size = "md" }: { category: MarkCategory; size?: "sm" | "md" }) => {
  const def = MARK_BY_CATEGORY[category];
  return (
    <span
      aria-hidden
      className={cn(
        "mark",
        `mark-${category}`,
        "inline-grid place-items-center rounded-sm font-ui font-bold no-underline",
        size === "sm" ? "size-5 text-xs" : "size-7 text-sm",
        def.treatment === "underline" && "border border-dashed border-current",
      )}
      style={{ color: `var(--mark-ink)`, margin: 0, padding: 0, textDecoration: "none" }}
    >
      {def.symbol}
    </span>
  );
};

/** Legend chip: swatch + label + optional count. Pressable to focus one category. */
export const MarkChip = ({
  category,
  count,
  pressed,
  onClick,
}: {
  category: MarkCategory;
  count?: number;
  pressed?: boolean;
  onClick?: () => void;
}) => {
  const def = MARK_BY_CATEGORY[category];
  const content = (
    <>
      <MarkSwatch category={category} size="sm" />
      <span className="font-semibold">{def.label}</span>
      {count !== undefined ? <span className="tabular-nums text-ink-faint">{count}</span> : null}
    </>
  );
  const base = "inline-flex h-8 items-center gap-2 rounded-md border pl-1.5 pr-2.5 font-ui text-sm text-ink";
  if (!onClick) {
    return <span className={cn(base, "border-rule bg-paper-raised")}>{content}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        base,
        "cursor-pointer transition-colors",
        pressed ? "border-ink bg-paper-overlay" : "border-rule bg-paper-raised hover:border-rule-strong",
      )}
    >
      {content}
    </button>
  );
};
