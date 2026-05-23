"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

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

function buildNarrative(decision: Decision, graphEntities?: string[], locale?: string): string {
  const method = decision.method;
  const entityCount = graphEntities?.length ?? 0;
  const entityNames = graphEntities?.slice(0, 3).join(", ") ?? "";
  const entityMore = entityCount > 3 ? ` +${entityCount - 3}` : "";

  if (locale === "tr") {
    if (method === "graph") {
      if (entityCount > 0) {
        return `Yönlendirici graf geçişini seçti çünkü ${entityCount} adlandırılmış varlık tespit edildi (${entityNames}${entityMore}) — bu, belgeler arası çok adımlı ilişki sorgusu olduğuna işaret ediyor.`;
      }
      return "Yönlendirici graf geçişini seçti çünkü sorguda ilişkisel veya nedensel sinyaller var — belgeler arası çok adımlı çıkarım için en uygun yöntem.";
    }
    if (method === "semantic") {
      return "Yönlendirici semantik aramayı seçti çünkü sorgu, doğrudan belge aramasına en uygun anahtar kelime kalıplarıyla eşleşiyor — çok adımlı varlık geçişine gerek yok.";
    }
    return "Yönlendirici hibrit strateji seçti — hem semantik arama hem de graf geçişini birleştirerek doğrudan arama ile varlık ilişkilerini kapsıyor.";
  }

  if (method === "graph") {
    if (entityCount > 0) {
      return `The router chose graph traversal because ${entityCount} named ${entityCount === 1 ? "entity" : "entities"} were detected (${entityNames}${entityMore}) — suggesting a multi-document relationship query.`;
    }
    return "The router chose graph traversal because the query contains relationship or causal signals — best for multi-hop reasoning across documents.";
  }
  if (method === "semantic") {
    return "The router chose semantic search because the query matches keyword patterns best suited for direct document lookup — no multi-hop traversal needed.";
  }
  return "The router chose hybrid retrieval — combining semantic search and graph traversal to cover both direct lookup and entity relationships.";
}

export function DecisionLog({ decision, retrievedDocs, graphEntities, timings }: Props) {
  const t = useTranslations("Components.DecisionLog");
  const locale = useLocale();
  const [showDetails, setShowDetails] = useState(false);
  const badgeStyle = METHOD_BADGE[decision.method as keyof typeof METHOD_BADGE] ?? "border-border bg-bg-input text-fg-muted";
  const narrative = buildNarrative(decision, graphEntities, locale);

  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-4">
      {/* Natural language summary */}
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-subtle">
        {t("whyTitle")}
      </p>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 font-mono text-xs font-semibold uppercase ${badgeStyle}`}>
          {decision.method}
        </span>
        <p className="text-sm leading-relaxed text-fg">{narrative}</p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setShowDetails((v) => !v)}
        className="mt-3 flex items-center gap-1 text-xs text-fg-subtle transition-colors hover:text-fg-muted"
      >
        <span>{showDetails ? t("hideDetails") : t("showDetails")}</span>
        <svg
          className={`h-3 w-3 transition-transform ${showDetails ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Technical details (collapsed by default) */}
      {showDetails && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {decision.signals.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {decision.signals.map((s, i) => (
                <span key={i} className="rounded bg-bg-input px-2 py-0.5 font-mono text-[11px] text-fg-muted">{s}</span>
              ))}
            </div>
          )}

          {graphEntities && graphEntities.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">{t("seedEntities")}</p>
              <div className="flex flex-wrap gap-1">
                {graphEntities.map((e, i) => (
                  <span key={`${e}-${i}`} className="rounded bg-indigo-950/50 px-2 py-0.5 text-xs text-indigo-300">{e}</span>
                ))}
              </div>
            </div>
          )}

          {retrievedDocs.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">{t("retrievedDocs")}</p>
              <div className="space-y-1">
                {retrievedDocs.map((doc) => (
                  <div key={doc.file_name} className="flex items-center gap-2 rounded bg-bg-input px-2 py-1.5">
                    <span className="font-mono text-xs text-fg">{doc.file_name.replace(".md", "")}</span>
                    {doc.similarity != null && (
                      <span className="ml-auto font-mono text-[11px] text-emerald-400">{doc.similarity.toFixed(3)}</span>
                    )}
                    {doc.hop != null && (
                      <span className="ml-auto font-mono text-[11px] text-indigo-400">hop {doc.hop}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {timings && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-fg-subtle">{t("timings")}</p>
              <div className="flex flex-wrap gap-3 font-mono text-xs text-fg-subtle">
                {timings.embeddingMs > 0 && <span>{t("embedTime",    { ms: timings.embeddingMs })}</span>}
                {timings.semanticMs  > 0 && <span>{t("semanticTime", { ms: timings.semanticMs  })}</span>}
                {timings.graphMs     > 0 && <span>{t("graphTime",    { ms: timings.graphMs     })}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
