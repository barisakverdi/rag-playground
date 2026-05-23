"use client";

import { useState, useEffect } from "react";

export function ArchitectureModal({ label }: { label: string }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-lg border border-border px-6 text-sm font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:bg-bg-subtle sm:w-auto"
      >
        {label}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-auto rounded-xl border border-border bg-bg-subtle p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-border bg-bg p-1.5 text-fg-subtle transition-colors hover:text-fg"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src="/architecture.svg" alt="System architecture diagram" className="w-full" />
          </div>
        </div>
      )}
    </>
  );
}
