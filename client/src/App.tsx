import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { StageGuide } from "./components/StageGuide/StageGuide";
import { VerseInput } from "./components/VerseInput/VerseInput";
import { Banner, Button, Eyebrow, Heading, IconButton, StageStepper, type GuidanceStatus } from "./design-system";
import { loadHighlights, saveHighlights } from "./hooks/highlightPersistence";
import { useLLM } from "./hooks/useLLM";
import { useSession } from "./hooks/useSession";
import { useStudyStore } from "./store/useStudyStore";
import { PassagePane } from "./study/PassagePane";
import { JOHN_3_16_18 } from "./study/samplePassage";
import type { HighlightMark, StageId } from "./types/study";

const SAMPLE_SESSIONS = [
  {
    id: 1,
    title: "God's Love and Judgment",
    passageRef: "JHN.3.16-21",
    createdAt: new Date().toISOString(),
    stageCompleted: 2 as StageId,
  },
];

type SessionDetail = { id: number; passage_ref: string; bible_id: number; passage_text: string };

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [stageNotes, setStageNotes] = useState<Record<number, string>>({});
  const [guidanceByStage, setGuidanceByStage] = useState<Record<number, string>>({});
  const [guidanceFailed, setGuidanceFailed] = useState<Record<number, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const denomination = "non-denominational";

  const { loading, requestGuidance } = useLLM();
  const { loadSessions, deleteSession } = useSession();

  const sortedSessions = useMemo(() => (sessions.length > 0 ? sessions : SAMPLE_SESSIONS), [sessions]);

  const resetStudyState = useCallback(() => {
    setStageNotes({});
    setGuidanceByStage({});
    setGuidanceFailed({});
    clearAllStaleStages();
    setCurrentStage(1);
  }, [clearAllStaleStages, setCurrentStage]);

  const handleLoadPassage = async (normalizedReference: string, nextWarning?: string) => {
    setWarning(nextWarning ?? null);
    setLoadError(null);
    setLoadingPassage(true);

    try {
      const response = await fetch(
        `/api/verse?bibleId=${encodeURIComponent(String(bibleId))}&usfm=${encodeURIComponent(normalizedReference)}`,
      );
      if (!response.ok) throw new Error();

      const payload = (await response.json()) as { text: string };
      setPassage(normalizedReference, payload.text, bibleId);
      setHighlights([]);
      resetStudyState();

      const created = await fetch("/api/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passageRef: normalizedReference, bibleId, title: `Study ${normalizedReference}`, passageText: payload.text }),
      });

      if (created.ok) {
        const body = (await created.json()) as { session: { id: number } };
        setActiveSessionId(body.session.id);
        await loadSessions().catch(() => undefined);
      }
    } catch {
      setLoadError(
        `Couldn't load ${normalizedReference}. Check the reference, and that the server is running with a YouVersion API key.`,
      );
    } finally {
      setLoadingPassage(false);
    }
  };

  const handleSelectSession = async (id: number) => {
    setSidebarOpen(false);
    setActiveSessionId(id);
    try {
      const response = await fetch(`/api/sessions/${id}`);
      if (!response.ok) return;
      const { session } = (await response.json()) as { session: SessionDetail };
      setPassage(session.passage_ref, session.passage_text, session.bible_id);
      setHighlights(loadHighlights(id));
      resetStudyState();
    } catch {
      // Server offline: keep the selection so the list still responds.
    }
  };

  const handleNewStudy = () => {
    setSidebarOpen(false);
    setActiveSessionId(null);
    setPassage(passageRef, "", bibleId);
    setHighlights([]);
    setWarning(null);
    setLoadError(null);
    resetStudyState();
    window.setTimeout(() => document.getElementById("passage-ref")?.focus(), 0);
  };

  const handleTrySample = () => {
    setActiveSessionId(null);
    setPassage("John 3:16–18", JOHN_3_16_18, bibleId);
    setHighlights([]);
    setLoadError(null);
    resetStudyState();
    setCurrentStage(2);
  };

  const handleMarksChange = (next: HighlightMark[]) => {
    setHighlights(next);
    if (activeSessionId) saveHighlights(activeSessionId, next);
    markStagesStaleAfter(2);
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

  const requestStageGuidance = useCallback(
    async (stage: StageId) => {
      try {
        const content = await requestGuidance({
          stage,
          passageRef,
          passageText,
          highlights,
          stageNotes: Object.entries(stageNotes).map(([s, content]) => ({ stage: Number(s), content })),
          denomination,
        });
        setGuidanceByStage((prev) => ({ ...prev, [stage]: content }));
        setGuidanceFailed((prev) => ({ ...prev, [stage]: false }));
        return true;
      } catch {
        setGuidanceFailed((prev) => ({ ...prev, [stage]: true }));
        return false;
      }
    },
    [denomination, highlights, passageRef, passageText, requestGuidance, stageNotes],
  );

  const regenerateStaleStages = async () => {
    setRefreshing(true);
    for (const stage of staleStages) {
      await requestStageGuidance(stage);
    }
    clearAllStaleStages();
    setRefreshing(false);
  };

  useEffect(() => {
    void loadSessions().catch(() => {
      // Server may be offline during isolated client work; sample sessions still render.
    });
  }, [loadSessions]);

  // Fetch guidance when entering a stage that has none, or whose guidance is stale.
  useEffect(() => {
    if (!passageText || currentStage < 2) return;

    const stage = currentStage;
    const isStale = staleStages.includes(stage);
    if (!isStale && (guidanceByStage[stage] || guidanceFailed[stage])) return;

    let cancelled = false;
    void (async () => {
      await requestStageGuidance(stage);
      if (!cancelled && isStale) clearStaleStage(stage);
    })();

    return () => {
      cancelled = true;
    };
  }, [clearStaleStage, currentStage, guidanceByStage, guidanceFailed, passageText, requestStageGuidance, staleStages]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === "]" && currentStage < 6) setCurrentStage((currentStage + 1) as StageId);
      if (event.key === "[" && currentStage > 1) setCurrentStage((currentStage - 1) as StageId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentStage, setCurrentStage]);

  const guidanceStatus: GuidanceStatus = loading
    ? "thinking"
    : guidanceFailed[currentStage]
      ? "offline"
      : staleStages.includes(currentStage)
        ? "stale"
        : guidanceByStage[currentStage]
          ? "ready"
          : "idle";

  const completedStage = Math.max(0, ...Object.keys(stageNotes).filter((s) => stageNotes[Number(s)]?.trim()).map(Number));

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:h-dvh lg:grid-cols-[15.5rem_minmax(0,1fr)_23rem] lg:overflow-hidden">
      {/* Sidebar: a column on large screens, a drawer below that. */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[17rem] border-r border-rule shadow-float transition-transform lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          sessions={sortedSessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => void handleSelectSession(id)}
          onDeleteSession={(id) => void handleDeleteSession(id)}
          onNewStudy={handleNewStudy}
          onClose={sidebarOpen ? () => setSidebarOpen(false) : undefined}
        />
      </div>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main ref={mainRef} className="flex min-w-0 flex-col lg:overflow-hidden">
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule bg-paper/95 px-4 py-2.5 backdrop-blur lg:static">
          <IconButton icon="list" label="Open sidebar" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)} />
          <StageStepper
            current={currentStage}
            completed={completedStage}
            stale={staleStages}
            onSelect={setCurrentStage}
            className="order-last w-full sm:order-none sm:w-auto sm:flex-1"
          />
          <VerseInput onSubmit={(ref, warn) => void handleLoadPassage(ref, warn)} busy={loadingPassage} className="ml-auto" />
        </header>

        <div className="flex-1 px-5 py-8 sm:px-10 lg:overflow-y-auto">
          <div className="mx-auto mb-6 flex max-w-[38rem] flex-col gap-2 empty:hidden">
            {warning ? <Banner tone="info">{warning}</Banner> : null}
            {loadError ? (
              <Banner tone="danger" title="Couldn't load the passage" action={<Button size="sm" onClick={handleTrySample}>Use sample</Button>}>
                {loadError}
              </Banner>
            ) : null}
          </div>

          <PassagePane
            reference={passageRef}
            translation="NASB 2020"
            text={passageText}
            marks={highlights}
            onMarksChange={handleMarksChange}
            empty={
              <div className="flex flex-col gap-4 py-10">
                <Eyebrow>New study</Eyebrow>
                <Heading level={1} className="text-3xl">
                  Open a passage to begin.
                </Heading>
                <p className="max-w-prose font-scripture text-lg leading-8 text-ink-muted">
                  Enter a book and chapter above, like <span className="text-ink">JHN.3</span> or{" "}
                  <span className="text-ink">ROM.8.1-11</span>, and press Load. Precept studies work best one chapter at a time.
                </p>
                <div>
                  <Button variant="secondary" icon="book" onClick={handleTrySample}>
                    Try with John 3:16–18
                  </Button>
                </div>
              </div>
            }
          />
        </div>
      </main>

      <div className="border-t border-rule bg-paper-raised lg:overflow-y-auto lg:border-t-0 lg:border-l">
        <StageGuide
          stage={currentStage}
          notes={stageNotes[currentStage] ?? ""}
          onNotesChange={(value) => {
            setStageNotes((prev) => ({ ...prev, [currentStage]: value }));
            markStagesStaleAfter(currentStage);
          }}
          guidance={guidanceByStage[currentStage]}
          guidanceStatus={passageText ? guidanceStatus : "idle"}
          onRegenerate={() => void requestStageGuidance(currentStage)}
          staleCount={staleStages.length}
          onRefreshStale={() => void regenerateStaleStages()}
          refreshing={refreshing}
          onSelectStage={setCurrentStage}
        />
      </div>
    </div>
  );
}

export default App;
