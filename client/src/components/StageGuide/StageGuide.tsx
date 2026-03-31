const STAGES = [
  "Prayer, Intent & First Read",
  "Mark Key Words & Themes",
  "5 W's & H Interrogation",
  "Context & Cross-References",
  "Interpretation",
  "Application",
] as const;

type StageGuideProps = {
  currentStage: number;
  staleStages: number[];
  onSelectStage: (stage: number) => void;
};

export const StageGuide = ({ currentStage, staleStages, onSelectStage }: StageGuideProps) => {
  return (
    <aside className="stage-guide" aria-label="Stage guide panel">
      <h2>Study Stages</h2>
      <ol>
        {STAGES.map((label, index) => {
          const stage = index + 1;
          return (
            <li key={label}>
              <button
                type="button"
                className={currentStage === stage ? "active" : ""}
                onClick={() => onSelectStage(stage)}
              >
                <span>Stage {stage}</span>
                <span>{label}</span>
                {staleStages.includes(stage) ? <em>stale</em> : null}
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
};
