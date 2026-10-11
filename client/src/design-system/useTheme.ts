import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "precepts-theme";

const readStored = (): ThemePreference => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
};

const apply = (preference: ThemePreference) => {
  const root = document.documentElement;
  if (preference === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", preference);
  }
};

/**
 * Light / dark / system preference. "system" leaves data-theme unset so the
 * stylesheet falls back to prefers-color-scheme.
 */
export const useTheme = () => {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStored);

  // Restore a saved explicit choice. "system" leaves the attribute alone so
  // anything the host page already set (or the OS preference) wins.
  useEffect(() => {
    const stored = readStored();
    if (stored !== "system") apply(stored);
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private window); the choice still applies this visit.
    }
  }, []);

  return { preference, setPreference };
};
