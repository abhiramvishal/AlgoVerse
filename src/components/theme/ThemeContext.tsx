"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  /* Sync on mount — read what the anti-flash script already applied */
  useEffect(() => {
    const stored = localStorage.getItem("algoverse_theme") as Theme | null;
    const resolved: Theme = stored ?? "dark";
    setTheme(resolved);
    document.documentElement.classList.toggle("light", resolved === "light");
    document.documentElement.classList.toggle("dark",  resolved === "dark");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.classList.toggle("dark",  next === "dark");
      localStorage.setItem("algoverse_theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
