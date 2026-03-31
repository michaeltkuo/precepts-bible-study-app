import type { HighlightMark, HighlightVisualStyle, MarkCategory } from "../../types/study";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelectionOffsets } from "../../hooks/useSelection";

type PassageViewProps = {
  passageRef: string;
  text: string;
  highlights: HighlightMark[];
  quickCategories: MarkCategory[];
  selectedStyle: HighlightVisualStyle;
  onQuickHighlight: (
    startOffset: number,
    endOffset: number,
    category: MarkCategory,
    visualStyle: HighlightVisualStyle
  ) => void;
  onDeleteHighlightsInRange: (startOffset: number, endOffset: number) => void;
  onSelectStyle: (style: HighlightVisualStyle) => void;
  onSelectionContextChange: (selection: { start: number; end: number } | null) => void;
};

const MARK_TOOLS: Record<MarkCategory, { label: string; icon: string }> = {
  god: { label: "God", icon: "△" },
  jesus: { label: "Jesus", icon: "✝" },
  holySpirit: { label: "Holy Spirit", icon: "☁" },
  people: { label: "People", icon: "✎" },
  sin: { label: "Sin", icon: "✗" },
  salvation: { label: "Salvation", icon: "★" },
  commands: { label: "Commands", icon: "→" },
  location: { label: "Location", icon: "⌖" },
  time: { label: "Time", icon: "◷" },
  contrast: { label: "Contrast", icon: "↔" },
};

type RenderSegment =
  | { type: "text"; text: string }
  | {
      type: "mark";
      text: string;
      iconCategory: MarkCategory | null;
      visualStyles: HighlightVisualStyle[];
    };

type ToolbarState = {
  start: number;
  end: number;
  left: number;
  top: number;
};

const STYLE_TOOLS: Array<{ id: HighlightVisualStyle; label: string; sample: string }> = [
  { id: "highlight-yellow", label: "Yellow Highlighter", sample: "Y" },
  { id: "highlight-blue", label: "Blue Highlighter", sample: "B" },
  { id: "highlight-green", label: "Green Highlighter", sample: "G" },
  { id: "highlight-orange", label: "Orange Highlighter", sample: "O" },
  { id: "highlight-pink", label: "Pink Highlighter", sample: "P" },
  { id: "highlight-purple", label: "Purple Highlighter", sample: "U" },
  { id: "highlight-red", label: "Red Highlighter", sample: "R" },
  { id: "highlight-brown", label: "Brown Highlighter", sample: "N" },
  { id: "highlight-gray", label: "Gray Highlighter", sample: "A" },
  { id: "underline", label: "Underline", sample: "U" },
  { id: "double-underline", label: "Double Underline", sample: "UU" },
  { id: "wavy-underline", label: "Wavy Underline", sample: "~" },
  { id: "strike", label: "Strikethrough", sample: "S" },
  { id: "bold", label: "Bold", sample: "B" },
  { id: "all-caps", label: "All Caps", sample: "A" },
  { id: "box", label: "Box", sample: "[]" },
  { id: "double-box", label: "Double Box", sample: "##" },
  { id: "brackets", label: "Brackets", sample: "[]" },
  { id: "left-bar", label: "Left Bar", sample: "|" },
  { id: "left-pointer", label: "Left Pointer", sample: "<" },
  { id: "inline-pointers", label: "Inline Pointers", sample: "<>" },
  { id: "exclamation", label: "Exclamation", sample: "!" },
  { id: "question", label: "Question", sample: "?" },
  { id: "shadow", label: "Shadow", sample: "S" },
];

const normalizeLegacyStyle = (style?: string): HighlightVisualStyle => {
  if (style === "triple-underline") {
    return "double-underline";
  }
  if (style === "double-strike") {
    return "strike";
  }
  return (style as HighlightVisualStyle) ?? "highlight-yellow";
};

const buildSegments = (source: string, marks: HighlightMark[]): RenderSegment[] => {
  if (marks.length === 0 || source.length === 0) {
    return [{ type: "text", text: source }];
  }

  const normalized = marks
    .map((mark) => ({
      ...mark,
      startOffset: Math.max(0, Math.min(mark.startOffset, source.length)),
      endOffset: Math.max(0, Math.min(mark.endOffset, source.length)),
      visualStyle: normalizeLegacyStyle(mark.visualStyle),
    }))
    .filter((mark) => mark.endOffset > mark.startOffset);

  const boundaries = new Set<number>([0, source.length]);
  for (const mark of normalized) {
    boundaries.add(mark.startOffset);
    boundaries.add(mark.endOffset);
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const segments: RenderSegment[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    if (end <= start) {
      continue;
    }

    const text = source.slice(start, end);
    const active = normalized.filter((mark) => mark.startOffset < end && mark.endOffset > start);

    if (active.length === 0) {
      segments.push({ type: "text", text });
      continue;
    }

    const iconCategory =
      active
        .filter((mark) => !mark.styleOnly)
        .sort((a, b) => (b.endOffset - b.startOffset) - (a.endOffset - a.startOffset))[0]
        ?.category ?? null;

    const visualStyles = active.reduce<HighlightVisualStyle[]>((acc, mark) => {
      if (!acc.includes(mark.visualStyle)) {
        acc.push(mark.visualStyle);
      }
      return acc;
    }, []);

    segments.push({
      type: "mark",
      text,
      iconCategory,
      visualStyles,
    });
  }

  return segments.filter((segment) => segment.text.length > 0);
};

export const PassageView = ({
  passageRef,
  text,
  highlights,
  quickCategories,
  selectedStyle,
  onQuickHighlight,
  onDeleteHighlightsInRange,
  onSelectStyle,
  onSelectionContextChange,
}: PassageViewProps) => {
  const wrapperRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLElement | null>(null);
  const { readOffsets } = useSelectionOffsets();
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [expandedTools, setExpandedTools] = useState(false);
  const lastSelectionKeyRef = useRef<string | null>(null);

  const renderedSegments = useMemo(() => buildSegments(text, highlights), [highlights, text]);

  const selectedTextCategory = useMemo<MarkCategory | null>(() => {
    if (!toolbar) {
      return null;
    }

    const overlaps = highlights
      .map((mark) => {
        const overlapStart = Math.max(toolbar.start, mark.startOffset);
        const overlapEnd = Math.min(toolbar.end, mark.endOffset);
        const overlapLength = Math.max(0, overlapEnd - overlapStart);
        return { category: mark.category, overlapLength };
      })
      .filter((entry) => entry.overlapLength > 0)
      .sort((a, b) => b.overlapLength - a.overlapLength);

    return overlaps[0]?.category ?? null;
  }, [highlights, toolbar]);

  const displayedQuickCategories = useMemo<MarkCategory[]>(
    () =>
      selectedTextCategory
        ? [
            selectedTextCategory,
            ...quickCategories.filter((category) => category !== selectedTextCategory),
          ].slice(0, 5)
        : quickCategories.length > 0
          ? quickCategories
          : (["god", "jesus", "holySpirit", "people", "sin"] as MarkCategory[]),
    [quickCategories, selectedTextCategory]
  );

  const secondaryTools = useMemo(
    () =>
      (Object.keys(MARK_TOOLS) as MarkCategory[]).filter(
        (category) => !displayedQuickCategories.includes(category)
      ),
    [displayedQuickCategories]
  );

  const hasOverlappingMark = useMemo(() => {
    if (!toolbar) {
      return false;
    }

    return highlights.some(
      (mark) => !(toolbar.end <= mark.startOffset || toolbar.start >= mark.endOffset)
    );
  }, [highlights, toolbar]);

  useEffect(() => {
    const updateToolbarFromSelection = () => {
      const container = textRef.current;
      const wrapper = wrapperRef.current;

      if (!container || !wrapper) {
        setToolbar(null);
        onSelectionContextChange(null);
        return;
      }

      const offsets = readOffsets(container);
      const selection = window.getSelection();

      if (!offsets || !selection || selection.rangeCount === 0) {
        setToolbar(null);
        return;
      }

      onSelectionContextChange({ start: offsets.start, end: offsets.end });

      const selectionKey = `${offsets.start}:${offsets.end}`;
      if (selectionKey !== lastSelectionKeyRef.current) {
        setExpandedTools(false);
        lastSelectionKeyRef.current = selectionKey;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      const left = rect.left - wrapperRect.left + rect.width / 2;
      const top = rect.top - wrapperRect.top - 44;

      setToolbar({
        start: offsets.start,
        end: offsets.end,
        left: Math.max(24, Math.min(left, wrapperRect.width - 24)),
        top: Math.max(8, top),
      });
    };

    const closeToolbar = () => {
      setToolbar(null);
      setExpandedTools(false);
    };

    document.addEventListener("selectionchange", updateToolbarFromSelection);
    document.addEventListener("scroll", closeToolbar, true);
    window.addEventListener("resize", closeToolbar);

    return () => {
      document.removeEventListener("selectionchange", updateToolbarFromSelection);
      document.removeEventListener("scroll", closeToolbar, true);
      window.removeEventListener("resize", closeToolbar);
    };
  }, [onSelectionContextChange, readOffsets]);

  const clearSelection = () => {
    const selection = window.getSelection();
    selection?.removeAllRanges();
  };

  const applyHighlight = (category: MarkCategory) => {
    if (!toolbar) {
      return;
    }

    onQuickHighlight(toolbar.start, toolbar.end, category, selectedStyle);
    clearSelection();
    setToolbar(null);
    setExpandedTools(false);
  };

  const deleteHighlightsInSelection = () => {
    if (!toolbar) {
      return;
    }

    onDeleteHighlightsInRange(toolbar.start, toolbar.end);
    clearSelection();
    setToolbar(null);
    setExpandedTools(false);
  };

  const copySelection = async () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? "";
    if (!selectedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedText);
    } catch {
      document.execCommand("copy");
    }

    clearSelection();
    setToolbar(null);
    setExpandedTools(false);
  };

  return (
    <section className="passage-view" aria-label="Passage view" ref={wrapperRef}>
      {toolbar ? (
        <div
          className="selection-toolbar"
          role="toolbar"
          aria-label="Selection actions"
          style={{ left: `${toolbar.left}px`, top: `${toolbar.top}px` }}
        >
          <button type="button" className="selection-tool action" onClick={() => void copySelection()}>
            Copy
          </button>
          {displayedQuickCategories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={`selection-tool ${index === 0 ? "primary" : ""}`}
              onClick={() => applyHighlight(category)}
              title={`Mark as ${MARK_TOOLS[category].label}`}
              aria-label={`Mark as ${MARK_TOOLS[category].label}`}
            >
              {MARK_TOOLS[category].icon}
            </button>
          ))}
          <button
            type="button"
            className="selection-tool danger"
            onClick={deleteHighlightsInSelection}
            title="Delete mark(s) in selection"
            aria-label="Delete mark(s) in selection"
            disabled={!hasOverlappingMark}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0A.5.5 0 0 1 8.5 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1 0-2H5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h2.5a1 1 0 0 1 1 1ZM6 1v1h4V1H6Zm-2 3v9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4H4Z" />
            </svg>
          </button>
          <button
            type="button"
            className="selection-tool action"
            onClick={() => setExpandedTools((previous) => !previous)}
            aria-label="Show all highlight tools"
          >
            ...
          </button>

          {expandedTools ? (
            <div className="selection-tool-grid" role="group" aria-label="All highlight tools">
              <p className="selection-subtitle">Categories</p>
              {secondaryTools.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="selection-tool"
                  title={MARK_TOOLS[category].label}
                  aria-label={`Mark as ${MARK_TOOLS[category].label}`}
                  onClick={() => applyHighlight(category)}
                >
                  {MARK_TOOLS[category].icon}
                </button>
              ))}

              <p className="selection-subtitle">Styles</p>
              {STYLE_TOOLS.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  className={`selection-tool style-tool ${selectedStyle === style.id ? "active" : ""}`}
                  aria-label={style.label}
                  title={style.label}
                  onClick={() => onSelectStyle(style.id)}
                >
                  <span className={`selection-style-sample style-preview style-${style.id}`}>{style.sample}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <header>
        <h2>{passageRef}</h2>
        <p>{highlights.length} highlights</p>
      </header>
      <article ref={textRef} className="passage-text">
        {text
          ? renderedSegments.map((segment, index) => {
              if (segment.type === "text") {
                return <span key={`text-${index}`}>{segment.text}</span>;
              }

              return (
                <span
                  key={`mark-${index}`}
                  className={`passage-mark ${segment.iconCategory ? `mark-${segment.iconCategory}` : "no-category-icon"} ${segment.visualStyles.map((style) => `style-${style}`).join(" ")}`}
                  data-icon={segment.iconCategory ? MARK_TOOLS[segment.iconCategory].icon : ""}
                  title={segment.iconCategory ? MARK_TOOLS[segment.iconCategory].label : "Styled mark"}
                >
                  {segment.text}
                </span>
              );
            })
          : "Load a passage to begin your study."}
      </article>
    </section>
  );
};
