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
  const colors = {
    emerald: {
      header: "border-emerald-800 bg-emerald-950/30 text-emerald-300",
      doc: "text-emerald-400",
      entity: "bg-emerald-950 text-emerald-300",
    },
    indigo: {
      header: "border-indigo-800 bg-indigo-950/30 text-indigo-300",
      doc: "text-indigo-400",
      entity: "bg-indigo-950 text-indigo-300",
    },
  }[color];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
      {/* Header */}
      <div className={`inline-flex w-fit items-center rounded border px-2.5 py-1 text-xs font-semibold ${colors.header}`}>
        {label}
      </div>

      {/* Retrieved docs */}
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wider text-zinc-600">
          Retrieved · {data.docs.length} docs
          {data.embeddingMs != null && data.embeddingMs > 0 && (
            <span className="ml-2 text-zinc-700">embed {data.embeddingMs}ms</span>
          )}
          <span className="ml-2 text-zinc-700">retrieval {data.retrievalMs}ms</span>
        </p>
        <div className="space-y-1">
          {data.docs.map((d) => (
            <div key={d.file_name} className="flex items-center gap-2 rounded bg-zinc-800/40 px-2 py-1">
              <span className="font-mono text-[11px] text-zinc-300">
                {d.file_name.replace(".md", "")}
              </span>
              {d.similarity != null && (
                <span className={`ml-auto font-mono text-[11px] ${colors.doc}`}>
                  {d.similarity.toFixed(3)}
                </span>
              )}
              {d.hop != null && (
                <span className={`ml-auto font-mono text-[11px] ${colors.doc}`}>
                  hop {d.hop}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Graph entities */}
      {data.matchedEntities && data.matchedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.matchedEntities.map((e) => (
            <span key={e} className={`rounded px-1.5 py-0.5 text-[11px] ${colors.entity}`}>
              {e}
            </span>
          ))}
        </div>
      )}

      {/* Answer */}
      <div className="min-h-[120px] rounded-lg bg-zinc-800/40 p-3">
        {data.answer ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
            {data.answer}
            {data.isStreaming && (
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-zinc-400" />
            )}
          </p>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-zinc-600">
              {data.isStreaming ? "Generating..." : "Waiting..."}
            </span>
          </div>
        )}
      </div>

      {/* Mini metrics */}
      {data.inputTokens > 0 && (
        <div className="flex gap-3 font-mono text-[11px] text-zinc-600">
          <span>{data.inputTokens} in</span>
          <span>{data.outputTokens} out</span>
          <span className="text-emerald-700">
            ${data.costUsd < 0.001 ? data.costUsd.toFixed(5) : data.costUsd.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
