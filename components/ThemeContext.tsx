"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "coffee" | "contrast";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "coffee",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("coffee");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme;
      const initial = stored === "contrast" ? "contrast" : "coffee";
      setThemeState(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {}
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
