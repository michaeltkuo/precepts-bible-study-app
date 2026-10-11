import type { ReactNode } from "react";
import { cn } from "../cn";
import { Icon } from "./Icon";

type Tone = "neutral" | "accent" | "gilt" | "success" | "warn" | "danger";

const BADGE_TONES: Record<Tone, string> = {
  neutral: "bg-paper-sunken text-ink-muted",
  accent: "bg-ribbon-soft text-ribbon",
  gilt: "bg-gilt-soft text-gilt",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

/** Small status label. Pair colour with a word or icon; never colour alone. */
export const Badge = ({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: string;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex h-6 items-center gap-1 rounded-sm px-2 font-ui text-xs font-semibold",
      BADGE_TONES[tone],
      className,
    )}
  >
    {icon ? <Icon name={icon} className="text-[0.85em]" /> : null}
    {children}
  </span>
);

type BannerTone = "info" | "warn" | "danger" | "success";

const BANNER: Record<BannerTone, { box: string; icon: string }> = {
  info: { box: "bg-paper-sunken text-ink border-rule", icon: "info-circle" },
  warn: { box: "bg-warn-soft text-ink border-warn/30", icon: "hourglass-split" },
  danger: { box: "bg-danger-soft text-ink border-danger/30", icon: "exclamation-octagon" },
  success: { box: "bg-success-soft text-ink border-success/30", icon: "check2-circle" },
};

const BANNER_ICON_COLOR: Record<BannerTone, string> = {
  info: "text-ink-muted",
  warn: "text-warn",
  danger: "text-danger",
  success: "text-success",
};

/** Inline message spanning its container, with an optional action on the right. */
export const Banner = ({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <div
    role={tone === "danger" ? "alert" : "status"}
    className={cn("flex flex-wrap items-start gap-3 rounded-md border px-4 py-3 font-ui text-sm", BANNER[tone].box)}
  >
    <Icon name={BANNER[tone].icon} className={cn("mt-0.5 text-base", BANNER_ICON_COLOR[tone])} />
    <div className="min-w-0 flex-1">
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={cn(title && "text-ink-muted")}>{children}</div>
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
