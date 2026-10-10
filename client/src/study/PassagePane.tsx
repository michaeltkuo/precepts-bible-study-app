import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PassageText } from "../design-system";
import { getSelectionOffsets } from "../hooks/useSelection";
import { KEY_WORD_BY_ID } from "../marking/library";
import type { Range } from "../marking/matcher";
import type { HighlightMark } from "../types/study";
import { KeyWordLegend } from "./KeyWordLegend";
import { MarkingToolbar } from "./MarkingToolbar";
import { useMarking } from "./useMarking";

type PassagePaneProps = {
  reference: string;
  translation: string;
  text: string;
  marks: HighlightMark[];
  onMarksChange: (marks: HighlightMark[]) => void;
  empty?: ReactNode;
};

type OpenSelection = Range & { top: number; left: number };

/** The passage page: marked text, the selection toolbar, and the key-word legend. */
export const PassagePane = ({ reference, translation, text, marks, onMarksChange, empty }: PassagePaneProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<OpenSelection | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const marking = useMarking({ text, marks, onChange: onMarksChange });

  const close = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  // Open the toolbar when a drag or keyboard selection finishes inside the passage.
  useEffect(() => {
    const readSelection = () => {
      const container = textRef.current;
      const wrapper = wrapperRef.current;
      if (!container || !wrapper) return;
      const offsets = getSelectionOffsets(container);
      const native = window.getSelection();
      if (!offsets || !native || native.rangeCount === 0) return;
      const rect = native.getRangeAt(0).getBoundingClientRect();
      const box = wrapper.getBoundingClientRect();
      const width = Math.min(368, box.width);
      setSelection({
        start: offsets.start,
        end: offsets.end,
        top: rect.bottom - box.top + 10,
        left: Math.max(0, Math.min(rect.left - box.left + rect.width / 2 - width / 2, box.width - width)),
      });
    };
    const onPointerUp = () => window.setTimeout(readSelection, 0);
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.shiftKey || event.key.startsWith("Arrow")) readSelection();
    };
    // Any press outside the toolbar starts over; a new drag reopens it on release.
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element | null)?.closest?.("[data-marking-toolbar]")) setSelection(null);
    };
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  // A new passage invalidates any open selection or traced key word.
  const [shownText, setShownText] = useState(text);
  if (text !== shownText) {
    setShownText(text);
    setSelection(null);
    setFocusId(null);
  }

  const existing = useMemo(() => {
    if (!selection) return [];
    const ids = new Set(
      marking.passageMarks
        .filter((m) => m.startOffset < selection.end && m.endOffset > selection.start)
        .map((m) => m.keywordId),
    );
    return [...ids].map((id) => KEY_WORD_BY_ID[id]);
  }, [marking.passageMarks, selection]);

  if (!text) {
    return <div className="mx-auto max-w-[38rem]">{empty}</div>;
  }

  return (
    <div ref={wrapperRef} className="relative mx-auto flex max-w-[38rem] flex-col gap-10">
      <article aria-label="Passage view">
        <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
          <h2 className="font-display text-2xl font-medium text-ink">{reference}</h2>
          <span className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {translation} · {marking.passageMarks.length} {marking.passageMarks.length === 1 ? "mark" : "marks"}
          </span>
        </header>
        <PassageText ref={textRef} text={text} marks={marking.passageMarks} focusKeywordId={focusId} className="selection:bg-gilt-soft" />
      </article>

      <KeyWordLegend
        legend={marking.legend}
        unmarked={marking.unmarked}
        focusId={focusId}
        onFocus={setFocusId}
        onMarkAll={marking.markAll}
      />

      {selection ? (
        <MarkingToolbar
          key={`${selection.start}:${selection.end}`}
          text={text}
          selection={selection}
          recent={marking.recent}
          existing={existing}
          countFor={marking.countFor}
          style={{ top: selection.top, left: selection.left }}
          onApply={(id, range) => {
            marking.apply(id, range);
            close();
          }}
          onMarkAll={(id) => {
            marking.markAll(id);
            close();
          }}
          onRemove={() => {
            marking.removeInRange(selection);
            close();
          }}
          onClose={close}
        />
      ) : null}
    </div>
  );
};
