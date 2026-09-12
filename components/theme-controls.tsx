"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const themes: Theme[] = ["light", "dark", "system"];

function applyTheme(theme: Theme) {
  const resolved = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    : theme;

  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePreference = theme;
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeControls() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = window.localStorage.getItem("site-theme");
    const initial = themes.includes(stored as Theme) ? stored as Theme : "system";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => theme === "system" && applyTheme("system");
    media.addEventListener("change", syncSystem);
    return () => media.removeEventListener("change", syncSystem);
  }, [theme]);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    window.localStorage.setItem("site-theme", nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <div className="theme-controls" aria-label="Appearance">
      {themes.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => selectTheme(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
