"use client";

interface DocMeta {
  file_name: string;
  similarity?: number;
  hop?: number;
  matched_entities?: string[];
}

interface SideData {
  docs: DocMeta[];
  answer: string;
  isStreaming: boolean;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  retrievalMs: number;
  embeddingMs?: number;
  matchedEntities?: string[];
}

interface Props {
  semantic: SideData;
  graph: SideData;
}

export function ComparisonPanel({ semantic, graph }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ComparisonSide label="Semantic Search" color="emerald" data={semantic} />
      <ComparisonSide label="Graph Traversal" color="indigo" data={graph} />
    </div>
  );
}

function ComparisonSide({
  label,
  color,
  data,
}: {
  label: string;
  color: "emerald" | "indigo";
  data: SideData;
}) {
  const badge = {
    emerald: "border-emerald-700 bg-emerald-950/50 text-emerald-300",
    indigo:  "border-indigo-700 bg-indigo-950/50 text-indigo-300",
  }[color];

  const docScore = {
    emerald: "text-emerald-400",
    indigo:  "text-indigo-400",
  }[color];

  const entity = {
    emerald: "bg-emerald-950/50 text-emerald-300",
    indigo:  "bg-indigo-950/50 text-indigo-300",
  }[color];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-subtle p-4">
      <span className={`inline-flex w-fit items-center rounded border px-2.5 py-1 text-xs font-semibold ${badge}`}>
        {label}
      </span>

      {/* Retrieved docs */}
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wider text-fg-subtle">
          Retrieved · {data.docs.length} docs
          {data.embeddingMs != null && data.embeddingMs > 0 && (
            <span className="ml-2">embed {data.embeddingMs}ms</span>
          )}
          <span className="ml-2">retrieval {data.retrievalMs}ms</span>
        </p>
        <div className="space-y-1">
          {data.docs.map((d) => (
            <div key={d.file_name} className="flex items-center gap-2 rounded bg-bg-input px-2 py-1">
              <span className="font-mono text-[11px] text-fg">
                {d.file_name.replace(".md", "")}
              </span>
              {d.similarity != null && (
                <span className={`ml-auto font-mono text-[11px] ${docScore}`}>
                  {d.similarity.toFixed(3)}
                </span>
              )}
              {d.hop != null && (
                <span className={`ml-auto font-mono text-[11px] ${docScore}`}>
                  hop {d.hop}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Graph seed entities */}
      {data.matchedEntities && data.matchedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.matchedEntities.map((e, i) => (
            <span key={`${e}-${i}`} className={`rounded px-1.5 py-0.5 text-[11px] ${entity}`}>
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Answer */}
      <div className="min-h-[120px] rounded-lg bg-bg-input p-3">
        {data.answer ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">
            {data.answer}
            {data.isStreaming && (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-fg-subtle" />
            )}
          </p>
        ) : (
          <div className="flex h-full min-h-[80px] items-center justify-center">
            <span className="text-xs text-fg-subtle">
              {data.isStreaming ? "Generating..." : "Waiting..."}
            </span>
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.inputTokens > 0 && (
        <div className="flex gap-3 font-mono text-[11px] text-fg-subtle">
          <span>{data.inputTokens} in</span>
          <span>{data.outputTokens} out</span>
          <span className="text-emerald-500">
            ${data.costUsd < 0.001 ? data.costUsd.toFixed(5) : data.costUsd.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
