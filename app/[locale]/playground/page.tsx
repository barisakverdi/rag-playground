"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PromptLibrary } from "@/components/PromptLibrary";
import { DecisionLog } from "@/components/DecisionLog";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { streamSSE, SSEEvent } from "@/lib/sse";

type Mode = "single" | "compare";
type Status = "idle" | "loading" | "done" | "error";

interface SingleResult {
  decision: { method: string; reason: string; signals: string[] };
  retrievedDocs: { file_name: string; similarity?: number; hop?: number }[];
  graphEntities: string[];
  timings: { embeddingMs: number; semanticMs: number; graphMs: number };
  answer: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

interface CompareResult {
  decision: { method: string; reason: string; signals: string[] };
  semantic: {
    docs: { file_name: string; similarity?: number }[];
    embeddingMs: number;
    retrievalMs: number;
    answer: string;
    isStreaming: boolean;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
    matchedEntities?: string[];
  };
  graph: {
    docs: { file_name: string; hop?: number; matched_entities?: string[] }[];
    matchedEntities: string[];
    retrievalMs: number;
    answer: string;
    isStreaming: boolean;
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
}

export default function PlaygroundPage() {
  const t = useTranslations("Playground");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const handleSelect = useCallback((q: string) => { setQuery(q); }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || status === "loading") return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("loading");
    setError("");
    setSingleResult(null);
    setCompareResult(null);

    try {
      if (mode === "single") {
        let result: SingleResult = {
          decision: { method: "", reason: "", signals: [] },
          retrievedDocs: [],
          graphEntities: [],
          timings: { embeddingMs: 0, semanticMs: 0, graphMs: 0 },
          answer: "",
          inputTokens: 0,
          outputTokens: 0,
          costUsd: 0,
        };

        await streamSSE("/api/query", { query, locale }, (event: SSEEvent) => {
          if (event.type === "meta") {
            result = { ...result, decision: event.decision, retrievedDocs: event.retrievedDocs ?? [], graphEntities: event.graphEntities ?? [], timings: event.timings ?? { embeddingMs: 0, semanticMs: 0, graphMs: 0 } };
            setSingleResult({ ...result });
          } else if (event.type === "chunk") {
            result.answer += event.text;
            setSingleResult({ ...result });
          } else if (event.type === "done") {
            result.inputTokens = event.inputTokens ?? 0;
            result.outputTokens = event.outputTokens ?? 0;
            result.costUsd = event.costUsd ?? 0;
            setSingleResult({ ...result });
            setStatus("done");
          }
        }, abortRef.current.signal);
      } else {
        let result: CompareResult = {
          decision: { method: "", reason: "", signals: [] },
          semantic: { docs: [], embeddingMs: 0, retrievalMs: 0, answer: "", isStreaming: false, inputTokens: 0, outputTokens: 0, costUsd: 0 },
          graph: { docs: [], matchedEntities: [], retrievalMs: 0, answer: "", isStreaming: false, inputTokens: 0, outputTokens: 0, costUsd: 0 },
        };

        await streamSSE("/api/compare", { query, locale }, (event: SSEEvent) => {
          if (event.type === "meta") {
            result = { ...result, decision: event.decision, semantic: { ...result.semantic, docs: event.semantic?.docs ?? [], embeddingMs: event.semantic?.embeddingMs ?? 0, retrievalMs: event.semantic?.retrievalMs ?? 0, isStreaming: true }, graph: { ...result.graph, docs: event.graph?.docs ?? [], matchedEntities: event.graph?.matchedEntities ?? [], retrievalMs: event.graph?.retrievalMs ?? 0, isStreaming: true } };
            setCompareResult({ ...result });
          } else if (event.type === "chunk") {
            if (event.side === "semantic") result.semantic.answer += event.text;
            else if (event.side === "graph") result.graph.answer += event.text;
            setCompareResult({ ...result });
          } else if (event.type === "done") {
            result.semantic = { ...result.semantic, inputTokens: event.semantic?.inputTokens ?? 0, outputTokens: event.semantic?.outputTokens ?? 0, costUsd: event.semantic?.costUsd ?? 0, isStreaming: false };
            result.graph = { ...result.graph, inputTokens: event.graph?.inputTokens ?? 0, outputTokens: event.graph?.outputTokens ?? 0, costUsd: event.graph?.costUsd ?? 0, isStreaming: false };
            setCompareResult({ ...result });
            setStatus("done");
          }
        }, abortRef.current.signal);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setError((err as Error).message ?? "Unknown error");
        setStatus("error");
      }
    }
  }, [query, mode, status]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-bg">
      {/* Navbar */}
      <header className="shrink-0 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="shrink-0 text-sm text-fg-muted transition-colors hover:text-fg">
              ←
            </Link>
            <span className="text-fg-subtle">|</span>
            <span className="truncate font-mono text-xs font-medium text-fg sm:text-sm">
              {t("title")}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden font-mono text-xs text-fg-subtle lg:inline">
              {t("corpusLabel")}
            </span>
            <LanguageSwitcher />
            <ThemeToggle />
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs text-fg-subtle transition-colors hover:text-fg-muted sm:inline"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`shrink-0 overflow-y-auto border-r border-border bg-bg-subtle transition-all duration-200 ${sidebarOpen ? "w-64 sm:w-72" : "w-0"}`}>
          {sidebarOpen && (
            <div className="p-3 sm:p-4">
              <PromptLibrary onSelect={handleSelect} activeQuery={query} />
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Query input */}
          <div className="shrink-0 border-b border-border bg-bg px-3 py-3 sm:px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="shrink-0 self-start rounded-lg border border-border p-2 text-fg-subtle transition-colors hover:bg-bg-subtle hover:text-fg"
                title={sidebarOpen ? t("hideExamples") : t("showExamples")}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("placeholder")}
                className="min-h-[52px] flex-1 resize-none rounded-lg border border-border bg-bg-input px-3 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-none"
                rows={2}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-border">
                <button onClick={() => setMode("single")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "single" ? "bg-bg-input text-fg" : "text-fg-subtle hover:text-fg-muted"}`}>
                  {t("modeSingle")}
                </button>
                <button onClick={() => setMode("compare")} className={`px-3 py-1.5 text-xs font-medium transition-colors ${mode === "compare" ? "bg-bg-input text-fg" : "text-fg-subtle hover:text-fg-muted"}`}>
                  {t("modeCompare")}
                </button>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!query.trim() || status === "loading"}
                className="ml-auto rounded-lg bg-accent px-5 py-1.5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-h disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                    {t("loading")}
                  </span>
                ) : t("ask")}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {status === "idle" && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-fg-subtle">{t("emptyTitle")}</p>
                <p className="mt-1 text-xs text-fg-subtle">{t("emptyHint")}</p>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
                Error: {error}
              </div>
            )}

            {mode === "single" && singleResult && (
              <div className="space-y-4">
                <DecisionLog
                  decision={singleResult.decision}
                  retrievedDocs={singleResult.retrievedDocs}
                  graphEntities={singleResult.graphEntities}
                  timings={singleResult.timings}
                />
                <div className="rounded-xl border border-border bg-bg-subtle p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-fg-subtle">
                    {t("answerLabel")}
                  </p>
                  {singleResult.answer ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">
                      {singleResult.answer}
                      {status === "loading" && (
                        <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-fg-subtle" />
                      )}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-fg-subtle">
                      <span className="h-3 w-3 animate-spin rounded-full border" style={{ borderColor: "rgb(var(--border))", borderTopColor: "rgb(var(--fg-muted))" }} />
                      {t("generating")}
                    </div>
                  )}
                </div>
                {singleResult.inputTokens > 0 && (
                  <MetricsPanel inputTokens={singleResult.inputTokens} outputTokens={singleResult.outputTokens} costUsd={singleResult.costUsd} />
                )}
              </div>
            )}

            {mode === "compare" && compareResult && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-fg-subtle">{t("autoRouterLabel")}</span>
                    <span className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${
                      compareResult.decision.method === "graph"
                        ? "border-indigo-700 bg-indigo-950/50 text-indigo-300"
                        : compareResult.decision.method === "semantic"
                        ? "border-emerald-700 bg-emerald-950/50 text-emerald-300"
                        : "border-amber-700 bg-amber-950/50 text-amber-300"
                    }`}>
                      {compareResult.decision.method}
                    </span>
                    <span className="text-xs text-fg-muted">{compareResult.decision.reason}</span>
                  </div>
                </div>
                <ComparisonPanel semantic={compareResult.semantic} graph={compareResult.graph} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
