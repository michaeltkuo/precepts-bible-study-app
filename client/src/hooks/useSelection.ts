import { useCallback } from "react";

export const getSelectionOffsets = (container: HTMLElement): { start: number; end: number } | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) {
    return null;
  }

  const preStart = range.cloneRange();
  preStart.selectNodeContents(container);
  preStart.setEnd(range.startContainer, range.startOffset);

  const preEnd = range.cloneRange();
  preEnd.selectNodeContents(container);
  preEnd.setEnd(range.endContainer, range.endOffset);

  const start = preStart.toString().length;
  const end = preEnd.toString().length;

  if (start === end) {
    return null;
  }

  return { start, end };
};

export const useSelectionOffsets = () => {
  const readOffsets = useCallback((container: HTMLElement) => getSelectionOffsets(container), []);
  return { readOffsets };
};
