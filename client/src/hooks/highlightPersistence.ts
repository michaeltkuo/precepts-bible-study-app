import type { HighlightMark } from "../types/study";

const keyForSession = (sessionId: number) => `precepts.highlights.${sessionId}`;
const memoryStorage = new Map<string, string>();

const safeStorage = (): Storage | undefined => {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
};

export const saveHighlights = (sessionId: number, highlights: HighlightMark[]) => {
  const key = keyForSession(sessionId);
  const value = JSON.stringify(highlights);
  const storage = safeStorage();

  if (storage) {
    storage.setItem(key, value);
    return;
  }

  memoryStorage.set(key, value);
};

export const loadHighlights = (sessionId: number): HighlightMark[] => {
  const key = keyForSession(sessionId);
  const storage = safeStorage();
  const raw = storage ? storage.getItem(key) : memoryStorage.get(key);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as HighlightMark[];
    return parsed;
  } catch {
    return [];
  }
};

export const clearHighlightCache = () => {
  const storage = safeStorage();
  if (storage) {
    storage.clear();
  }
  memoryStorage.clear();
};
