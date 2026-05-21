"use client";

import { useTranslations } from "next-intl";

interface Props {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  llmMs?: number;
}

export function MetricsPanel({ inputTokens, outputTokens, costUsd, llmMs }: Props) {
  const t = useTranslations("Components.MetricsPanel");

  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-fg-subtle">
        {t("title")}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label={t("inputTokens")}  value={inputTokens.toLocaleString()} />
        <Metric label={t("outputTokens")} value={outputTokens.toLocaleString()} />
        <Metric label={t("estCost")} value={`$${costUsd < 0.001 ? costUsd.toFixed(5) : costUsd.toFixed(4)}`} accent="emerald" />
        {llmMs != null && <Metric label={t("llmTime")} value={`${llmMs}ms`} />}
      </div>
      <p className="mt-3 font-mono text-[11px] text-fg-subtle">{t("modelInfo")}</p>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: "emerald" }) {
  return (
    <div className="rounded-lg bg-bg-input p-3">
      <p className="text-[11px] text-fg-subtle">{label}</p>
      <p className={`mt-1 font-mono text-sm font-semibold ${accent === "emerald" ? "text-emerald-400" : "text-fg"}`}>
        {value}
      </p>
    </div>
  );
}
