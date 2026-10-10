import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../cn";

const CONTROL =
  "w-full rounded-md border border-rule-strong bg-paper-overlay text-ink placeholder:text-ink-faint " +
  "transition-colors duration-150 hover:border-ink-faint focus:border-ribbon focus:outline-none " +
  "focus:ring-2 focus:ring-ribbon/20 aria-[invalid=true]:border-danger";

type FieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

/** Label + control + hint/error, with the ids wired for accessibility. */
export const Field = ({ id, label, hint, error, optional, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="flex items-baseline gap-2 font-ui text-sm font-semibold text-ink">
      {label}
      {optional ? <span className="text-xs font-normal text-ink-faint">Optional</span> : null}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-sm text-danger">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="text-sm text-ink-muted">
        {hint}
      </p>
    ) : null}
  </div>
);

export const TextInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(CONTROL, "h-10 px-3 font-ui text-base", className)} {...rest} />
);

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** "journal" uses the reading face for longer personal writing. */
  variant?: "ui" | "journal";
};

export const TextArea = ({ variant = "journal", className, ...rest }: TextAreaProps) => (
  <textarea
    className={cn(
      CONTROL,
      "min-h-28 resize-y px-3.5 py-3",
      variant === "journal" ? "font-scripture text-base leading-7" : "font-ui text-base",
      className,
    )}
    {...rest}
  />
);
