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
  graph:    "border-indigo-700 bg-indigo-950/50 text-indigo-300",
  semantic: "border-emerald-700 bg-emerald-950/50 text-emerald-300",
  hybrid:   "border-amber-700 bg-amber-950/50 text-amber-300",
};

export function DecisionLog({ decision, retrievedDocs, graphEntities, timings }: Props) {
  const badgeStyle =
    METHOD_BADGE[decision.method as keyof typeof METHOD_BADGE] ??
    "border-border bg-bg-input text-fg-muted";

  return (
    <div className="space-y-4 rounded-xl border border-border bg-bg-subtle p-4">
      {/* Router decision */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-subtle">
          Auto Router Decision
        </p>
        <span className={`inline-block rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${badgeStyle}`}>
          {decision.method}
        </span>
        <p className="mt-2 text-sm text-fg">{decision.reason}</p>
        {decision.signals.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {decision.signals.map((s, i) => (
              <span key={i} className="rounded bg-bg-input px-2 py-0.5 font-mono text-[11px] text-fg-muted">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Graph entities */}
      {graphEntities && graphEntities.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">
            Seed Entities
          </p>
          <div className="flex flex-wrap gap-1">
            {graphEntities.map((e, i) => (
              <span key={`${e}-${i}`} className="rounded bg-indigo-950/50 px-2 py-0.5 text-xs text-indigo-300">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Retrieved docs */}
      {retrievedDocs.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">
            Retrieved Documents
          </p>
          <div className="space-y-1">
            {retrievedDocs.map((doc) => (
              <div key={doc.file_name} className="flex items-center gap-2 rounded bg-bg-input px-2 py-1.5">
                <span className="font-mono text-xs text-fg">
                  {doc.file_name.replace(".md", "")}
                </span>
                {doc.similarity != null && (
                  <span className="ml-auto font-mono text-[11px] text-emerald-400">
                    {doc.similarity.toFixed(3)}
                  </span>
                )}
                {doc.hop != null && (
                  <span className="ml-auto font-mono text-[11px] text-indigo-400">
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
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">
            Retrieval Timings
          </p>
          <div className="flex flex-wrap gap-3 font-mono text-xs text-fg-subtle">
            {timings.embeddingMs > 0 && <span>embed {timings.embeddingMs}ms</span>}
            {timings.semanticMs > 0 && <span>semantic {timings.semanticMs}ms</span>}
            {timings.graphMs > 0 && <span>graph {timings.graphMs}ms</span>}
          </div>
        </div>
      )}
    </div>
  );
}
