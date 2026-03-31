import { useState } from "react";
import type { FormEvent } from "react";
import { parseUsfmReference } from "./parseUsfm";

type VerseInputProps = {
  defaultValue?: string;
  onSubmit: (normalizedReference: string, warning?: string) => void;
};

export const VerseInput = ({ defaultValue = "JHN.3.16-21", onSubmit }: VerseInputProps) => {
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
    <form className="verse-input" onSubmit={handleSubmit}>
      <label htmlFor="passage-ref">Passage</label>
      <div className="verse-input-row">
        <input
          id="passage-ref"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="JHN.3.16-21"
          aria-describedby={error ? "passage-error" : undefined}
        />
        <button type="submit">Load</button>
      </div>
      {error ? (
        <p id="passage-error" role="alert" className="input-error">
          {error}
        </p>
      ) : null}
    </form>
  );
};
