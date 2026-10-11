export type MarkSpan = { id: string; startOffset: number; endOffset: number };

export type MarkTreeNode<M extends MarkSpan> =
  | { type: "text"; start: number; end: number; text: string }
  | { type: "mark"; mark: M; start: number; end: number; children: MarkTreeNode<M>[] };

type Piece<M> = { mark: M; s: number; e: number };

const byStartThenLongest = <M>(a: Piece<M>, b: Piece<M>) => a.s - b.s || b.e - b.s - (a.e - a.s);

/**
 * Nest marks so each one renders as a single unbroken element: a cloud or box
 * around "word of the Lord" stays whole while "Lord" inside it carries its own
 * mark. Marks that cross a boundary are split at it.
 */
export const buildMarkTree = <M extends MarkSpan>(text: string, marks: M[]): MarkTreeNode<M>[] => {
  const pieces = marks
    .map((mark) => ({
      mark,
      s: Math.max(0, Math.min(mark.startOffset, text.length)),
      e: Math.max(0, Math.min(mark.endOffset, text.length)),
    }))
    .filter((p) => p.e > p.s);

  const textNode = (start: number, end: number): MarkTreeNode<M> => ({
    type: "text",
    start,
    end,
    text: text.slice(start, end),
  });

  const build = (input: Piece<M>[], from: number, to: number): MarkTreeNode<M>[] => {
    const nodes: MarkTreeNode<M>[] = [];
    let cursor = from;
    let queue = [...input];

    while (queue.length > 0) {
      queue.sort(byStartThenLongest);
      const parent = queue.shift()!;
      const start = Math.max(parent.s, cursor);
      if (parent.e <= start) continue;
      if (start > cursor) nodes.push(textNode(cursor, start));

      const inner: Piece<M>[] = [];
      const rest: Piece<M>[] = [];
      for (const q of queue) {
        if (q.s >= parent.e) {
          rest.push(q);
          continue;
        }
        const qs = Math.max(q.s, start);
        if (q.e <= qs) continue;
        if (q.e <= parent.e) {
          inner.push({ ...q, s: qs });
        } else {
          inner.push({ ...q, s: qs, e: parent.e });
          rest.push({ ...q, s: parent.e });
        }
      }

      nodes.push({ type: "mark", mark: parent.mark, start, end: parent.e, children: build(inner, start, parent.e) });
      cursor = parent.e;
      queue = rest;
    }

    if (cursor < to) nodes.push(textNode(cursor, to));
    return nodes;
  };

  return build(pieces, 0, text.length);
};
