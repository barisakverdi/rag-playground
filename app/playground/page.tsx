"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { PromptLibrary } from "@/components/PromptLibrary";
import { DecisionLog } from "@/components/DecisionLog";
import { MetricsPanel } from "@/components/MetricsPanel";
import { ComparisonPanel } from "@/components/ComparisonPanel";
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
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Navbar */}
      <header className="shrink-0 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              ← Home
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="font-mono text-sm text-zinc-200">Adaptive RAG Playground</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-zinc-600 sm:inline">
              BrewPulse Coffee · North England ops
            </span>
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`shrink-0 overflow-y-auto border-r border-zinc-800 bg-zinc-900/30 transition-all duration-200 ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <div className="p-4">
              <PromptLibrary onSelect={handleSelect} activeQuery={query} />
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Query input area */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-950 p-4">
            <div className="flex gap-2">
              {/* Sidebar toggle */}
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="shrink-0 rounded-lg border border-zinc-700 px-2 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title={sidebarOpen ? "Hide examples" : "Show examples"}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about BrewPulse Coffee North England operations… (⌘+Enter to send)"
                className="min-h-[56px] flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-800/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
                rows={2}
              />

              <div className="flex shrink-0 flex-col gap-2">
                {/* Mode toggle */}
                <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
                  <button
                    onClick={() => setMode("single")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === "single"
                        ? "bg-zinc-700 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setMode("compare")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      mode === "compare"
                        ? "bg-zinc-700 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Compare
                  </button>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!query.trim() || status === "loading"}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                      <span>Loading</span>
                    </span>
                  ) : (
                    "Ask →"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results area */}
          <div className="flex-1 overflow-y-auto p-4">
            {status === "idle" && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-zinc-600">
                  Select a query from the sidebar or type your own.
                </p>
                <p className="mt-1 text-xs text-zinc-700">
                  Try Q20 for a WOW graph traversal demo.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
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
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Answer
                  </p>
                  {singleResult.answer ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                        {singleResult.answer}
                        {status === "loading" && (
                          <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <span className="h-3 w-3 animate-spin rounded-full border border-zinc-700 border-t-zinc-400" />
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
                {/* Router decision */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">Auto router would choose:</span>
                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${
                        compareResult.decision.method === "graph"
                          ? "border-indigo-700 bg-indigo-950 text-indigo-300"
                          : compareResult.decision.method === "semantic"
                          ? "border-emerald-700 bg-emerald-950 text-emerald-300"
                          : "border-amber-700 bg-amber-950 text-amber-300"
                      }`}
                    >
                      {compareResult.decision.method}
                    </span>
                    <span className="text-xs text-zinc-400">{compareResult.decision.reason}</span>
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
