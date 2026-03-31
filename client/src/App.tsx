import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import { PassageView } from "./components/PassageView/PassageView";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { StageGuide } from "./components/StageGuide/StageGuide";
import { VerseInput } from "./components/VerseInput/VerseInput";
import { useHighlight } from "./hooks/useHighlight";
import { useLLM } from "./hooks/useLLM";
import { useSession } from "./hooks/useSession";
import { useStudyStore } from "./store/useStudyStore";
import type { HighlightVisualStyle, MarkCategory, StageId } from "./types/study";

const STYLE_PRESETS: Array<{ id: HighlightVisualStyle; label: string; sample: string }> = [
  { id: "highlight-yellow", label: "Yellow Highlight", sample: "Aa" },
  { id: "highlight-blue", label: "Blue Highlight", sample: "Aa" },
  { id: "highlight-green", label: "Green Highlight", sample: "Aa" },
  { id: "highlight-orange", label: "Orange Highlight", sample: "Aa" },
  { id: "highlight-pink", label: "Pink Highlight", sample: "Aa" },
  { id: "highlight-purple", label: "Purple Highlight", sample: "Aa" },
  { id: "highlight-red", label: "Red Highlight", sample: "Aa" },
  { id: "underline", label: "Underline", sample: "Aa" },
  { id: "double-underline", label: "Double Underline", sample: "Aa" },
  { id: "wavy-underline", label: "Wavy Underline", sample: "Aa" },
  { id: "strike", label: "Strikethrough", sample: "Aa" },
  { id: "bold", label: "Bold", sample: "Aa" },
  { id: "all-caps", label: "All Caps", sample: "aa" },
  { id: "box", label: "Box", sample: "Aa" },
  { id: "double-box", label: "Double Box", sample: "Aa" },
  { id: "brackets", label: "Brackets", sample: "Aa" },
  { id: "left-bar", label: "Left Margin Bar", sample: "Aa" },
  { id: "left-pointer", label: "Left Pointer", sample: "Aa" },
  { id: "inline-pointers", label: "Inline Pointers", sample: "Aa" },
  { id: "exclamation", label: "Exclamation", sample: "Aa" },
  { id: "question", label: "Question", sample: "Aa" },
  { id: "shadow", label: "Shadow", sample: "Aa" },
];

const CATEGORY_ORDER: MarkCategory[] = [
  "god",
  "jesus",
  "holySpirit",
  "people",
  "sin",
  "salvation",
  "commands",
  "location",
  "time",
  "contrast",
];

const SAMPLE_SESSIONS = [
  {
    id: 1,
    title: "God's Love and Judgment",
    passageRef: "JHN.3.16-21",
    createdAt: new Date().toISOString(),
    stageCompleted: 2 as StageId,
  },
];

const STAGE_COPY: Record<
  StageId,
  {
    title: string;
    goal: string;
    instructions: string[];
  }
> = {
  1: {
    title: "Prayer, Intent & First Read",
    goal: "Observe the passage without interpreting it yet.",
    instructions: [
      "Read the passage once without highlighting anything.",
      "Write a short first impression in Stage Notes.",
      "Ask: what stands out immediately in the text?",
    ],
  },
  2: {
    title: "Mark Key Words & Themes",
    goal: "Capture repeated words, themes, and key actions.",
    instructions: [
      "Select text in the passage to open the pop-up tool box.",
      "Use the tool icons to mark key words and themes.",
      "Focus on repeated ideas, commands, people, and contrasts.",
    ],
  },
  3: {
    title: "5 W's & H Interrogation",
    goal: "Interrogate the passage with concrete questions.",
    instructions: [
      "Use Stage Notes to answer Who, What, Where, When, Why, How.",
      "Keep answers tied to exact words in the passage.",
      "Use the stage guidance below to probe your marked words.",
    ],
  },
  4: {
    title: "Context & Cross-References",
    goal: "Add nearby context and supporting references.",
    instructions: [
      "Note surrounding context from the same chapter/book.",
      "Record any cross-references that clarify this passage.",
      "Pay close attention to contrast words and logical connectors.",
    ],
  },
  5: {
    title: "Interpretation",
    goal: "Form interpretation only after observation is complete.",
    instructions: [
      "Summarize what the text means from your observations.",
      "Avoid jumping ahead of the passage evidence.",
      "Use guidance to test your interpretation for consistency.",
    ],
  },
  6: {
    title: "Application",
    goal: "Turn interpretation into a personal response.",
    instructions: [
      "Write one concrete application for this week.",
      "Identify a command to obey, promise to trust, or principle to live.",
      "Keep application specific and measurable.",
    ],
  },
};

function App() {
  const {
    sessions,
    activeSessionId,
    setSessions,
    setActiveSessionId,
    passageRef,
    passageText,
    bibleId,
    setPassage,
    currentStage,
    setCurrentStage,
    highlights,
    setHighlights,
    staleStages,
    markStagesStaleAfter,
    clearStaleStage,
    clearAllStaleStages,
  } = useStudyStore();

  const [recentCategories, setRecentCategories] = useState<MarkCategory[]>([]);
  const [warning, setWarning] = useState<string | null>(null);
  const [stageNotes, setStageNotes] = useState<Record<number, string>>({});
  const [guidanceByStage, setGuidanceByStage] = useState<Record<number, string>>({});
  const [showToolsReference, setShowToolsReference] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<HighlightVisualStyle>("highlight-yellow");
  const [activeSelection, setActiveSelection] = useState<{ start: number; end: number } | null>(null);
  const denomination = "non-denominational";

  const { addHighlight } = useHighlight(highlights, setHighlights);
  const { loading, requestGuidance } = useLLM();
  const { loadSessions, deleteSession } = useSession();

  const sortedSessions = useMemo(() => {
    if (sessions.length > 0) {
      return sessions;
    }
    return SAMPLE_SESSIONS;
  }, [sessions]);

  const handleLoadPassage = async (normalizedReference: string, nextWarning?: string) => {
    setWarning(nextWarning ?? null);

    const response = await fetch(
      `/api/verse?bibleId=${encodeURIComponent(String(bibleId))}&usfm=${encodeURIComponent(normalizedReference)}`
    );

    if (!response.ok) {
      throw new Error("Unable to load passage.");
    }

    const payload = (await response.json()) as { text: string };
    setPassage(normalizedReference, payload.text, bibleId);

    const title = `Study ${normalizedReference}`;
    const created = await fetch("/api/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        passageRef: normalizedReference,
        bibleId,
        title,
        passageText: payload.text,
      }),
    });

    if (created.ok) {
      const body = (await created.json()) as { session: { id: number } };
      setActiveSessionId(body.session.id);
      await loadSessions();
    }
  };

  const quickCategories = useMemo<MarkCategory[]>(() => {
    const recentUnique = recentCategories.filter(
      (category, index) => recentCategories.indexOf(category) === index
    );
    const fallback = CATEGORY_ORDER.filter((category) => !recentUnique.includes(category));
    return [...recentUnique, ...fallback].slice(0, 5);
  }, [recentCategories]);

  const handleQuickHighlight = (
    start: number,
    end: number,
    category: MarkCategory,
    visualStyle: HighlightVisualStyle
  ) => {
    addHighlight(start, end, category, visualStyle, { styleOnly: false });
    setRecentCategories((previous) => [category, ...previous.filter((item) => item !== category)]);
    markStagesStaleAfter(2);
  };

  const handleApplyStyleOnly = (start: number, end: number, style: HighlightVisualStyle) => {
    const category = resolveCategoryForRange(start, end);
    addHighlight(start, end, category, style, { styleOnly: true });
    markStagesStaleAfter(2);
  };

  const resolveCategoryForRange = (start: number, end: number): MarkCategory => {
    const overlaps = highlights
      .map((mark) => {
        const overlapStart = Math.max(start, mark.startOffset);
        const overlapEnd = Math.min(end, mark.endOffset);
        const overlapLength = Math.max(0, overlapEnd - overlapStart);
        return { category: mark.category, overlapLength };
      })
      .filter((entry) => entry.overlapLength > 0)
      .sort((a, b) => b.overlapLength - a.overlapLength);

    return overlaps[0]?.category ?? quickCategories[0] ?? "god";
  };

  const applyStyleFromPanel = (style: HighlightVisualStyle) => {
    setSelectedStyle(style);
    if (!activeSelection) {
      return;
    }

    const start = Math.min(activeSelection.start, activeSelection.end);
    const end = Math.max(activeSelection.start, activeSelection.end);
    handleApplyStyleOnly(start, end, style);
  };

  const handleDeleteHighlightRange = (start: number, end: number) => {
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);
    const next = highlights.filter(
      (mark) => rangeEnd <= mark.startOffset || rangeStart >= mark.endOffset
    );

    if (next.length !== highlights.length) {
      setHighlights(next);
      markStagesStaleAfter(2);
    }
  };

  const handleDeleteSession = async (id: number) => {
    try {
      await deleteSession(id);
    } catch {
      setSessions(sortedSessions.filter((session) => session.id !== id));
    }

    if (activeSessionId === id) {
      const remaining = sortedSessions.filter((session) => session.id !== id);
      setActiveSessionId(remaining[0]?.id ?? null);
    }
  };

  const currentStageNote = stageNotes[currentStage] ?? "";
  const currentGuidance =
    guidanceByStage[currentStage] ??
    (passageText
      ? "LLM guidance appears here automatically when you enter this stage."
      : "Load a passage to begin stage-specific guidance.");
  const currentStageCopy = STAGE_COPY[currentStage];

  const requestStageGuidance = useCallback(
    async (stage: StageId) => {
      const content = await requestGuidance({
        stage,
        passageRef,
        passageText,
        highlights,
        stageNotes: Object.entries(stageNotes).map(([s, content]) => ({
          stage: Number(s),
          content,
        })),
        denomination,
      });

      setGuidanceByStage((prev) => ({ ...prev, [stage]: content }));
    },
    [denomination, highlights, passageRef, passageText, requestGuidance, stageNotes]
  );

  const regenerateStaleStages = async () => {
    for (const stage of staleStages) {
      await requestStageGuidance(stage);
    }

    clearAllStaleStages();
  };

  useEffect(() => {
    void loadSessions().catch(() => {
      // Server may be offline during isolated client work; sample sessions still render.
    });
  }, [loadSessions]);

  useEffect(() => {
    if (!passageText || currentStage < 2) {
      return;
    }

    const stage = currentStage;
    const isStale = staleStages.includes(stage);
    const hasGuidance = Boolean(guidanceByStage[stage]);

    if (!isStale && hasGuidance) {
      return;
    }

    let cancelled = false;

    void (async () => {
      await requestStageGuidance(stage);

      if (!cancelled && isStale) {
        clearStaleStage(stage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    clearStaleStage,
    currentStage,
    guidanceByStage,
    passageRef,
    passageText,
    requestStageGuidance,
    staleStages,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        return;
      }

      if (event.key === "]" && currentStage < 6) {
        setCurrentStage((currentStage + 1) as StageId);
      }

      if (event.key === "[" && currentStage > 1) {
        setCurrentStage((currentStage - 1) as StageId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentStage, setCurrentStage]);

  return (
    <div className={`app-shell ${showToolsReference ? "with-tools-reference" : ""}`}>
      <Sidebar
        sessions={sortedSessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onDeleteSession={(id) => {
          void handleDeleteSession(id);
        }}
        onNewStudy={() => {
          setSessions(SAMPLE_SESSIONS);
          setActiveSessionId(SAMPLE_SESSIONS[0].id);
        }}
      />

      <main className="study-canvas">
        <VerseInput onSubmit={handleLoadPassage} />
        <p className="bias-note" title="This AI assistant may reflect assumptions from published commentary. Verify observations against the text itself.">
          AI note: Suggestions can carry denominational assumptions. Verify against Scripture text.
        </p>
        <button
          type="button"
          className="tools-reference-toggle"
          onClick={() => setShowToolsReference((previous) => !previous)}
        >
          {showToolsReference ? "Hide Tools Reference" : "Show Tools Reference"}
        </button>
        {warning ? <p className="warning-banner">{warning}</p> : null}

        {staleStages.length > 0 ? (
          <div className="warning-banner">
            {staleStages.length} stage(s) are stale due to earlier edits.
            <button type="button" onClick={regenerateStaleStages} disabled={loading || !passageText}>
              Regenerate now
            </button>
          </div>
        ) : null}

        <section className="stage-status-card" aria-label="Current stage guidance">
          <div className="stage-status-header">
            <div>
              <p className="stage-status-kicker">Current Stage</p>
              <h2>
                Stage {currentStage}: {currentStageCopy.title}
              </h2>
            </div>
            <span className={`llm-status ${loading ? "thinking" : "idle"}`}>
              LLM: {loading ? "Thinking" : "Idle"}
            </span>
          </div>
          <p className="stage-status-goal">{currentStageCopy.goal}</p>
          <ul className="stage-status-list">
            {currentStageCopy.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>

          <div className="stage-status-llm">
            <h3>LLM Guidance</h3>
            <pre className="guidance-output">{currentGuidance}</pre>
          </div>
        </section>

        <PassageView
          passageRef={passageRef}
          text={passageText}
          highlights={highlights}
          quickCategories={quickCategories}
          selectedStyle={selectedStyle}
          onQuickHighlight={handleQuickHighlight}
          onDeleteHighlightsInRange={handleDeleteHighlightRange}
          onSelectStyle={setSelectedStyle}
          onSelectionContextChange={setActiveSelection}
        />

        <section className="stage-notes" aria-label="Stage notes">
          <h2>Stage {currentStage} Notes</h2>
          <textarea
            value={currentStageNote}
            onChange={(event) => {
              const next = event.target.value;
              setStageNotes((prev) => ({ ...prev, [currentStage]: next }));
              markStagesStaleAfter(currentStage);
            }}
            placeholder="Write your observations for this stage..."
          />
        </section>
      </main>

      <StageGuide
        currentStage={currentStage}
        staleStages={staleStages}
        onSelectStage={(stage) => setCurrentStage(stage as StageId)}
      />

      {showToolsReference ? (
        <aside className="tools-reference-panel" aria-label="Markup tools reference">
          <h2>Markup Tools</h2>

          <p className="tools-reference-note">
            Select text in passage, then click any style below to apply immediately.
          </p>

          <div className="tools-preset-grid" role="group" aria-label="Markup style presets">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`tools-preset ${selectedStyle === preset.id ? "active" : ""}`}
                onClick={() => applyStyleFromPanel(preset.id)}
              >
                <span className={`tools-preset-sample style-preview style-${preset.id}`}>{preset.sample}</span>
                <span className="tools-preset-label">{preset.label}</span>
              </button>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}

export default App;
