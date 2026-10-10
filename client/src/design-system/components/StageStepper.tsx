import type { StageId } from "../../types/study";
import { cn } from "../cn";
import { Icon } from "./Icon";
import { STAGES } from "../stages";

type StageStepperProps = {
  current: StageId;
  /** Highest stage the user has finished. */
  completed: number;
  /** Stages whose AI guidance needs regenerating. */
  stale?: StageId[];
  onSelect?: (stage: StageId) => void;
  className?: string;
};

/**
 * The six inductive stages as a horizontal path. Every stage stays clickable
 * because the method encourages going back; stale stages carry an amber dot.
 */
export const StageStepper = ({ current, completed, stale = [], onSelect, className }: StageStepperProps) => (
  <nav aria-label="Study stages" className={cn("@container w-full min-w-0 overflow-x-auto", className)}>
    <ol className="flex min-w-max items-stretch gap-1">
      {STAGES.map((stage, index) => {
        const isCurrent = stage.id === current;
        const isDone = stage.id <= completed && !isCurrent;
        const isStale = stale.includes(stage.id);
        return (
          <li key={stage.id} className="flex items-center gap-1">
            {index > 0 ? (
              <span aria-hidden className={cn("h-px w-4 sm:w-6", stage.id <= completed + 1 ? "bg-gilt" : "bg-rule")} />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect?.(stage.id)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Stage ${stage.id}: ${stage.short}${isStale ? " (out of date)" : ""}`}
              title={`Stage ${stage.id}: ${stage.title}${isStale ? " (guidance out of date)" : ""}`}
              className={cn(
                "group relative flex items-center gap-2 rounded-md px-2.5 py-1.5 font-ui text-sm transition-colors cursor-pointer",
                isCurrent ? "bg-ribbon-soft text-ribbon" : "text-ink-muted hover:bg-paper-sunken hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border text-xs font-bold tabular-nums",
                  isCurrent && "border-ribbon bg-ribbon text-ribbon-ink",
                  isDone && "border-gilt bg-gilt-soft text-gilt",
                  !isCurrent && !isDone && "border-rule-strong text-ink-faint",
                )}
              >
                {isDone ? <Icon name="check-lg" /> : stage.id}
              </span>
              <span className={cn("font-semibold", isCurrent ? "inline" : "hidden @[36rem]:inline")}>{stage.short}</span>
              {isStale ? (
                <span aria-hidden className="absolute right-1 top-1 size-2 rounded-full bg-warn ring-2 ring-paper" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
