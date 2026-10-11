import { Banner, Button, Eyebrow, Field, GuidanceCard, Heading, STAGES, TextArea, type GuidanceStatus } from "../../design-system";
import type { StageId } from "../../types/study";

const STAGE_COPY: Record<StageId, { goal: string; instructions: string[] }> = {
  1: {
    goal: "Observe the passage without interpreting it yet.",
    instructions: [
      "Read the passage once without marking anything.",
      "Write a short first impression in your notes.",
      "Ask: what stands out immediately in the text?",
    ],
  },
  2: {
    goal: "Mark the key words and themes the author repeats.",
    instructions: [
      "Select a word to see suggested key-word marks, or type to search the library.",
      "Use “All” to mark every occurrence of a key word at once.",
      "Check “Also in this passage” for key words you haven't marked yet.",
    ],
  },
  3: {
    goal: "Interrogate the passage with concrete questions.",
    instructions: [
      "Answer Who, What, Where, When, Why and How in your notes.",
      "Keep answers tied to exact words in the passage.",
      "Use the study guide's questions to probe your marked words.",
    ],
  },
  4: {
    goal: "Add nearby context and supporting references.",
    instructions: [
      "Note surrounding context from the same chapter and book.",
      "Record cross-references that clarify this passage.",
      "Pay close attention to contrasts and conclusions.",
    ],
  },
  5: {
    goal: "Form an interpretation only after observation is complete.",
    instructions: [
      "Summarise what the text means from your observations.",
      "Avoid jumping ahead of the evidence in the passage.",
      "Use the guide's questions to test your interpretation.",
    ],
  },
  6: {
    goal: "Turn interpretation into a personal response.",
    instructions: [
      "Write one concrete application for this week.",
      "Name a command to obey, a promise to trust, or a principle to live by.",
      "Keep it specific enough to act on.",
    ],
  },
};

type StageGuideProps = {
  stage: StageId;
  notes: string;
  onNotesChange: (value: string) => void;
  guidance?: string;
  guidanceStatus: GuidanceStatus;
  onRegenerate: () => void;
  staleCount: number;
  onRefreshStale: () => void;
  refreshing: boolean;
  onSelectStage: (stage: StageId) => void;
};

/** The right-hand margin: what to do in this stage, the study guide, and your notes. */
export const StageGuide = ({
  stage,
  notes,
  onNotesChange,
  guidance,
  guidanceStatus,
  onRegenerate,
  staleCount,
  onRefreshStale,
  refreshing,
  onSelectStage,
}: StageGuideProps) => {
  const meta = STAGES[stage - 1];
  const copy = STAGE_COPY[stage];
  const previous = STAGES[stage - 2];
  const next = STAGES[stage];

  return (
    <aside aria-label="Stage guide panel" className="flex flex-col gap-5 p-5">
      {staleCount > 0 ? (
        <Banner
          tone="warn"
          title={`${staleCount} ${staleCount === 1 ? "stage is" : "stages are"} out of date`}
          action={
            <Button size="sm" onClick={onRefreshStale} disabled={refreshing}>
              {refreshing ? "Refreshing…" : "Refresh now"}
            </Button>
          }
        >
          You changed earlier work. Each stage refreshes its questions when you open it.
        </Banner>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Eyebrow>Stage {stage} of 6</Eyebrow>
        <Heading level={2} className="text-xl">
          {meta.title}
        </Heading>
        <p className="text-sm text-ink-muted">{copy.goal}</p>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-4 text-sm text-ink-muted marker:text-ink-faint">
          {copy.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>

      <GuidanceCard
        status={guidanceStatus}
        content={guidance}
        onRegenerate={onRegenerate}
        idleText={stage === 1 ? "Read slowly first. The guide's questions start in Stage 2, once you've marked the text." : undefined}
      />

      <Field id={`stage-notes-${stage}`} label={`Stage ${stage} notes`}>
        <TextArea
          id={`stage-notes-${stage}`}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Write your observations for this stage..."
          className="min-h-36"
        />
      </Field>

      <div className="flex items-center justify-between gap-2">
        {previous ? (
          <Button variant="ghost" size="sm" icon="arrow-left" onClick={() => onSelectStage(previous.id)}>
            {previous.short}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button variant="primary" iconAfter="arrow-right" onClick={() => onSelectStage(next.id)}>
            Continue to {next.short}
          </Button>
        ) : null}
      </div>
    </aside>
  );
};
