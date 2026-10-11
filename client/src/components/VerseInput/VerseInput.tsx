import { useState } from "react";
import type { FormEvent } from "react";
import { Button, cn, TextInput } from "../../design-system";
import { parseUsfmReference } from "./parseUsfm";

type VerseInputProps = {
  defaultValue?: string;
  busy?: boolean;
  onSubmit: (normalizedReference: string, warning?: string) => void;
  className?: string;
};

export const VerseInput = ({ defaultValue = "JHN.3.16-21", busy, onSubmit, className }: VerseInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const parsed = parseUsfmReference(value);
      onSubmit(parsed.normalized, parsed.warning);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Invalid passage reference.";
      setError(message);
    }
  };

  return (
    <form className={cn("relative flex items-center gap-2", className)} onSubmit={handleSubmit}>
      <label htmlFor="passage-ref" className="font-ui text-sm font-semibold text-ink-muted">
        Passage
      </label>
      <TextInput
        id="passage-ref"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="JHN.3.16-21"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "passage-error" : undefined}
        className="h-8 w-36 text-sm"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={busy}>
        {busy ? "Loading…" : "Load"}
      </Button>
      {error ? (
        <p
          id="passage-error"
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 w-72 rounded-md border border-danger/30 bg-danger-soft px-3 py-2 font-ui text-sm text-ink shadow-float"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
};
