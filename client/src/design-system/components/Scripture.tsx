import { forwardRef, type ReactNode } from "react";
import { KEY_WORD_BY_ID, keyWordName } from "../../marking/library";
import { buildMarkTree, type MarkTreeNode } from "../../marking/markTree";
import { cn } from "../cn";
import { KeyWordMark } from "./KeyWordMark";

export type PassageMark = { id: string; startOffset: number; endOffset: number; keywordId: string };

type PassageTextProps = {
  text: string;
  marks: PassageMark[];
  /** When set, marks of other key words fade so one theme can be traced. */
  focusKeywordId?: string | null;
  className?: string;
};

const renderNodes = (nodes: MarkTreeNode<PassageMark>[], focus: string | null | undefined): ReactNode =>
  nodes.map((node) => {
    if (node.type === "text") return <span key={`t${node.start}`}>{node.text}</span>;
    const kw = KEY_WORD_BY_ID[node.mark.keywordId];
    const children = renderNodes(node.children, focus);
    if (!kw) return <span key={`m${node.mark.id}-${node.start}`}>{children}</span>;
    return (
      <KeyWordMark
        key={`m${node.mark.id}-${node.start}`}
        id={node.mark.id}
        recipe={kw.recipe}
        length={node.end - node.start}
        dimmed={Boolean(focus) && focus !== kw.id}
        title={keyWordName(kw)}
      >
        {children}
      </KeyWordMark>
    );
  });

/**
 * Passage text with key-word marks, set in the reading face with room above
 * each line for symbols. Offsets in `marks` are character offsets into `text`;
 * the rendered DOM text is exactly `text`, so selections map back cleanly.
 */
export const PassageText = forwardRef<HTMLDivElement, PassageTextProps>(({ text, marks, focusKeywordId, className }, ref) => (
  <div ref={ref} className={cn("isolate whitespace-pre-wrap font-scripture text-scripture text-ink [text-wrap:pretty]", className)}>
    {renderNodes(buildMarkTree(text, marks), focusKeywordId)}
  </div>
));
PassageText.displayName = "PassageText";

/** Passage with its reference heading, as a page of a study Bible. */
export const ScripturePassage = ({
  reference,
  translation,
  className,
  ...textProps
}: PassageTextProps & { reference: string; translation: string }) => (
  <article className={cn("mx-auto max-w-[38rem]", className)} aria-label={`${reference} (${translation})`}>
    <header className="mb-6 flex items-baseline justify-between gap-4 border-b border-rule pb-3">
      <h2 className="font-display text-2xl font-medium text-ink">{reference}</h2>
      <span className="font-ui text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{translation}</span>
    </header>
    <PassageText {...textProps} />
  </article>
);
