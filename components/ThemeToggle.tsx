"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-8 w-8" />;

  const isCoffee = theme === "coffee";

  return (
    <button
      onClick={() => setTheme(isCoffee ? "contrast" : "coffee")}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-fg-subtle transition-colors hover:border-fg-subtle hover:text-fg"
      title={isCoffee ? "Switch to Dark Contrast" : "Switch to Coffee theme"}
      aria-label="Toggle theme"
    >
      {isCoffee ? (
        /* Half-circle = contrast/high-contrast icon */
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        /* Coffee cup icon */
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" strokeLinecap="round" />
          <line x1="10" y1="2" x2="10" y2="4" strokeLinecap="round" />
          <line x1="14" y1="2" x2="14" y2="4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
