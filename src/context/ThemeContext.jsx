"use client";

import { createContext, useContext, useState, useMemo, useEffect } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "applyons-dashboard-theme";

function getInitialDark() {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch (_) {}
  return document.documentElement.classList.contains("dark");
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    document.documentElement.className = isDark ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch (_) {}
  }, [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      setDark: (dark) => setIsDark(!!dark),
      toggleTheme: () => setIsDark((prev) => !prev),
    }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
