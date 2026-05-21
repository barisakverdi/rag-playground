"use client";

interface Props {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  llmMs?: number;
}

export function MetricsPanel({ inputTokens, outputTokens, costUsd, llmMs }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        LLM Metrics
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Input tokens" value={inputTokens.toLocaleString()} />
        <Metric label="Output tokens" value={outputTokens.toLocaleString()} />
        <Metric
          label="Est. cost"
          value={`$${costUsd < 0.001 ? costUsd.toFixed(5) : costUsd.toFixed(4)}`}
          accent="emerald"
        />
        {llmMs != null && <Metric label="LLM time" value={`${llmMs}ms`} />}
      </div>
      <p className="mt-3 font-mono text-[11px] text-zinc-400 dark:text-zinc-600">
        Claude Haiku 4.5 · $0.80/M input · $4.00/M output
      </p>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: "emerald" }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/60">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${accent === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-100"}`}>
        {value}
      </p>
    </div>
  );
}
