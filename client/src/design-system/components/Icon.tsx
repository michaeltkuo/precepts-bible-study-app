import { cn } from "../cn";

type IconProps = {
  /** Bootstrap Icons name without the `bi-` prefix, e.g. "journal-bookmark". */
  name: string;
  className?: string;
  label?: string;
};

/** Bootstrap Icons glyph. Decorative unless a label is given. */
export const Icon = ({ name, className, label }: IconProps) => (
  <i
    className={cn(`bi bi-${name}`, "inline-flex leading-none", className)}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? "img" : undefined}
  />
);
