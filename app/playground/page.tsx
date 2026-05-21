"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PromptLibrary } from "@/components/PromptLibrary";
import { DecisionLog } from "@/components/DecisionLog";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ComparisonPanel } from "@/components/ComparisonPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("single");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const abortRef = useRef<AbortController | null>(null);
  const llmStartRef = useRef<number>(0);

  const handleSelect = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || status === "loading") return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus("loading");
    setError("");
    setSingleResult(null);
    setCompareResult(null);
    llmStartRef.current = Date.now();

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

        await streamSSE(
          "/api/query",
          { query },
          (event: SSEEvent) => {
            if (event.type === "meta") {
              result = {
                ...result,
                decision: event.decision,
                retrievedDocs: event.retrievedDocs ?? [],
                graphEntities: event.graphEntities ?? [],
                timings: event.timings ?? { embeddingMs: 0, semanticMs: 0, graphMs: 0 },
              };
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
          },
          abortRef.current.signal
        );
      } else {
        let result: CompareResult = {
          decision: { method: "", reason: "", signals: [] },
          semantic: {
            docs: [],
            embeddingMs: 0,
            retrievalMs: 0,
            answer: "",
            isStreaming: false,
            inputTokens: 0,
            outputTokens: 0,
            costUsd: 0,
          },
          graph: {
            docs: [],
            matchedEntities: [],
            retrievalMs: 0,
            answer: "",
            isStreaming: false,
            inputTokens: 0,
            outputTokens: 0,
            costUsd: 0,
          },
        };

        await streamSSE(
          "/api/compare",
          { query },
          (event: SSEEvent) => {
            if (event.type === "meta") {
              result = {
                ...result,
                decision: event.decision,
                semantic: {
                  ...result.semantic,
                  docs: event.semantic?.docs ?? [],
                  embeddingMs: event.semantic?.embeddingMs ?? 0,
                  retrievalMs: event.semantic?.retrievalMs ?? 0,
                  isStreaming: true,
                },
                graph: {
                  ...result.graph,
                  docs: event.graph?.docs ?? [],
                  matchedEntities: event.graph?.matchedEntities ?? [],
                  retrievalMs: event.graph?.retrievalMs ?? 0,
                  isStreaming: true,
                },
              };
              setCompareResult({ ...result });
            } else if (event.type === "chunk") {
              if (event.side === "semantic") {
                result.semantic.answer += event.text;
              } else if (event.side === "graph") {
                result.graph.answer += event.text;
              }
              setCompareResult({ ...result });
            } else if (event.type === "done") {
              result.semantic = {
                ...result.semantic,
                inputTokens: event.semantic?.inputTokens ?? 0,
                outputTokens: event.semantic?.outputTokens ?? 0,
                costUsd: event.semantic?.costUsd ?? 0,
                isStreaming: false,
              };
              result.graph = {
                ...result.graph,
                inputTokens: event.graph?.inputTokens ?? 0,
                outputTokens: event.graph?.outputTokens ?? 0,
                costUsd: event.graph?.costUsd ?? 0,
                isStreaming: false,
              };
              setCompareResult({ ...result });
              setStatus("done");
            }
          },
          abortRef.current.signal
        );
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
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white dark:bg-zinc-950">
      {/* Navbar */}
      <header className="shrink-0 border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
              ←
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="truncate font-mono text-xs font-medium text-zinc-900 dark:text-zinc-200 sm:text-sm">
              Adaptive RAG Playground
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden font-mono text-xs text-zinc-400 dark:text-zinc-600 lg:inline">
              BrewPulse Coffee · North England ops
            </span>
            <ThemeToggle />
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 sm:inline"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile by default */}
        <aside
          className={`shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50 transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-900/30 ${
            sidebarOpen ? "w-64 sm:w-72" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <div className="p-3 sm:p-4">
              <PromptLibrary onSelect={handleSelect} activeQuery={query} />
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Query input area */}
          <div className="shrink-0 border-b border-zinc-200 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-4">
            {/* Row 1: toggle + textarea */}
            <div className="flex gap-2">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="shrink-0 self-start rounded-lg border border-zinc-300 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                title={sidebarOpen ? "Hide examples" : "Show examples"}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about BrewPulse Coffee North England ops… (Ctrl+Enter)"
                className="min-h-[52px] flex-1 resize-none rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder-zinc-600 dark:focus:border-zinc-500"
                rows={2}
              />
            </div>

            {/* Row 2: mode toggle + submit */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
                <button
                  onClick={() => setMode("single")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === "single"
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  Single
                </button>
                <button
                  onClick={() => setMode("compare")}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === "compare"
                      ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  Compare
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!query.trim() || status === "loading"}
                className="ml-auto rounded-lg bg-indigo-600 px-5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                    Loading
                  </span>
                ) : (
                  "Ask →"
                )}
              </button>
            </div>
          </div>

          {/* Results area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4">
            {status === "idle" && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-600">
                  Select a query from the sidebar or type your own.
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-700">
                  Try Q20 for a WOW graph traversal demo.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                Error: {error}
              </div>
            )}

            {/* Single mode results */}
            {mode === "single" && singleResult && (
              <div className="space-y-4">
                <DecisionLog
                  decision={singleResult.decision}
                  retrievedDocs={singleResult.retrievedDocs}
                  graphEntities={singleResult.graphEntities}
                  timings={singleResult.timings}
                />

                {/* Answer */}
                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Answer
                  </p>
                  {singleResult.answer ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                      {singleResult.answer}
                      {status === "loading" && (
                        <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
                      )}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-600">
                      <span className="h-3 w-3 animate-spin rounded-full border border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400" />
                      Generating answer…
                    </div>
                  )}
                </div>

                {singleResult.inputTokens > 0 && (
                  <MetricsPanel
                    inputTokens={singleResult.inputTokens}
                    outputTokens={singleResult.outputTokens}
                    costUsd={singleResult.costUsd}
                  />
                )}
              </div>
            )}

            {/* Compare mode results */}
            {mode === "compare" && compareResult && (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">Auto router would choose:</span>
                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${
                        compareResult.decision.method === "graph"
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          : compareResult.decision.method === "semantic"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {compareResult.decision.method}
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{compareResult.decision.reason}</span>
                  </div>
                </div>

                <ComparisonPanel
                  semantic={compareResult.semantic}
                  graph={compareResult.graph}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
