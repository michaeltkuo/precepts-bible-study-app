import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { Icon } from "./Icon";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ribbon text-ribbon-ink border-transparent hover:bg-ribbon-hover shadow-page",
  secondary: "bg-paper-raised text-ink border-rule-strong hover:bg-paper-sunken",
  ghost: "bg-transparent text-ink-muted border-transparent hover:bg-paper-sunken hover:text-ink",
  danger: "bg-transparent text-danger border-transparent hover:bg-danger-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-base gap-2",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconAfter?: string;
  children: ReactNode;
};

export const Button = ({
  variant = "secondary",
  size = "md",
  icon,
  iconAfter,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md border font-ui font-semibold",
      "transition-colors duration-150 ease-turn cursor-pointer",
      "disabled:cursor-not-allowed disabled:opacity-45",
      VARIANTS[variant],
      SIZES[size],
      className,
    )}
    {...rest}
  >
    {icon ? <Icon name={icon} /> : null}
    {children}
    {iconAfter ? <Icon name={iconAfter} /> : null}
  </button>
);

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
  size?: ButtonSize;
  variant?: Exclude<ButtonVariant, "primary">;
};

/** Square icon-only button. `label` is required for screen readers and tooltips. */
export const IconButton = ({
  icon,
  label,
  size = "md",
  variant = "ghost",
  className,
  type = "button",
  ...rest
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex items-center justify-center rounded-md border transition-colors duration-150 cursor-pointer",
      "disabled:cursor-not-allowed disabled:opacity-45",
      VARIANTS[variant],
      size === "sm" ? "size-8 text-sm" : "size-10 text-base",
      className,
    )}
    {...rest}
  >
    <Icon name={icon} />
  </button>
);
