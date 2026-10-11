import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type SurfaceTone = "raised" | "sunken" | "plain";

const TONES: Record<SurfaceTone, string> = {
  raised: "bg-paper-raised border border-rule shadow-page",
  sunken: "bg-paper-sunken",
  plain: "bg-transparent",
};

type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  tone?: SurfaceTone;
  padded?: boolean;
};

/**
 * A sheet of paper. Use `raised` for the one thing that should stand apart
 * (the passage, a popover), `sunken` for wells and the sidebar, `plain` for
 * grouping without decoration. Don't nest raised inside raised.
 */
export const Surface = ({ tone = "raised", padded = true, className, ...rest }: SurfaceProps) => (
  <div className={cn("rounded-lg", TONES[tone], padded && "p-5", className)} {...rest} />
);

/** Small caps label used above sections and fields. */
export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("font-ui text-2xs font-semibold uppercase tracking-[0.12em] text-ink-faint", className)}>
    {children}
  </p>
);

/** Display heading in the book face. */
export const Heading = ({
  level = 2,
  children,
  className,
}: {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) => {
  const Tag = `h${level}` as const;
  const size = level === 1 ? "text-3xl" : level === 2 ? "text-xl" : "text-lg";
  return <Tag className={cn("font-display font-medium text-ink", size, className)}>{children}</Tag>;
};

/** A hairline divider with an optional centred ornament, like a chapter break. */
export const Rule = ({ ornament = false, className }: { ornament?: boolean; className?: string }) =>
  ornament ? (
    <div className={cn("flex items-center gap-3 text-gilt", className)} role="separator">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-display text-sm">❧</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  ) : (
    <hr className={cn("border-0 h-px bg-rule", className)} />
  );
