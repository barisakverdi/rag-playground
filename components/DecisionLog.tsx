"use client";

interface Decision {
  method: string;
  reason: string;
  signals: string[];
}

interface RetrievedDoc {
  file_name: string;
  similarity?: number;
  hop?: number;
  matched_entities?: string[];
}

interface Props {
  decision: Decision;
  retrievedDocs: RetrievedDoc[];
  graphEntities?: string[];
  timings?: { embeddingMs: number; semanticMs: number; graphMs: number };
}

const METHOD_BADGE = {
  graph: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  semantic: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  hybrid: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

export function DecisionLog({ decision, retrievedDocs, graphEntities, timings }: Props) {
  const badgeStyle =
    METHOD_BADGE[decision.method as keyof typeof METHOD_BADGE] ??
    "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      {/* Router decision */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Auto Router Decision
        </p>
        <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${badgeStyle}`}>
          {decision.method}
        </span>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{decision.reason}</p>
        {decision.signals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {decision.signals.map((s, i) => (
              <span key={i} className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Graph entities */}
      {graphEntities && graphEntities.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Seed Entities
          </p>
          <div className="flex flex-wrap gap-1">
            {graphEntities.map((e, i) => (
              <span key={`${e}-${i}`} className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Retrieved docs */}
      {retrievedDocs.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Retrieved Documents
          </p>
          <div className="space-y-1">
            {retrievedDocs.map((doc) => (
              <div key={doc.file_name} className="flex items-center gap-2 rounded bg-zinc-50 px-2 py-1.5 dark:bg-zinc-800/50">
                <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                  {doc.file_name.replace(".md", "")}
                </span>
                {doc.similarity != null && (
                  <span className="ml-auto font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    {doc.similarity.toFixed(3)}
                  </span>
                )}
                {doc.hop != null && (
                  <span className="ml-auto font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                    hop {doc.hop}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timings */}
      {timings && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Retrieval Timings
          </p>
          <div className="flex flex-wrap gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-500">
            {timings.embeddingMs > 0 && <span>embed {timings.embeddingMs}ms</span>}
            {timings.semanticMs > 0 && <span>semantic {timings.semanticMs}ms</span>}
            {timings.graphMs > 0 && <span>graph {timings.graphMs}ms</span>}
          </div>
        </div>
      )}
    </div>
  );
}
