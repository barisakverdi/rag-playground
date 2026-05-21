import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Nav */}
      <nav className="border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-mono text-xs text-fg-subtle sm:text-sm">
            rag.barisakverdi.com
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-fg-muted transition-colors hover:text-fg sm:text-sm"
            >
              {t("githubLink")}
            </a>
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-6 sm:py-24">

        {/* ── Hero ── */}
        <div className="mx-auto w-full max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-700 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300">
            {t("badge")}
          </div>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/playground"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-h sm:w-auto"
            >
              {t("tryDemo")}
            </Link>
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-8 text-sm font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:bg-bg-subtle sm:w-auto"
            >
              {t("viewSource")}
            </a>
          </div>
        </div>

        {/* ── Feature cards ── */}
        <div className="mx-auto mt-16 grid w-full max-w-5xl grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-3">
          <FeatureCard label={t("features.graphLabel")}   color="indigo"  description={t("features.graphDesc")} />
          <FeatureCard label={t("features.compareLabel")} color="emerald" description={t("features.compareDesc")} />
          <FeatureCard label={t("features.decisionLabel")}color="amber"   description={t("features.decisionDesc")} />
        </div>

        {/* ── Stats ── */}
        <div className="mx-auto mt-10 flex w-full max-w-5xl flex-wrap justify-center gap-6 sm:gap-10">
          {[
            { value: "201", label: t("stats.entities") },
            { value: "175", label: t("stats.relationships") },
            { value: "8",   label: t("stats.documents") },
            { value: "20",  label: t("stats.queries") },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-fg sm:text-3xl">{s.value}</p>
              <p className="text-xs text-fg-subtle">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tech stack ── */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {["Next.js 16", "Claude Haiku 4.5", "Voyage AI voyage-3", "pgvector", "Supabase", "Vercel"].map((t) => (
            <span key={t} className="rounded-md border border-border bg-bg-subtle px-3 py-1 font-mono text-xs text-fg-muted">
              {t}
            </span>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mx-auto mt-20 w-full max-w-5xl border-t border-border" />

        {/* ── About the corpus ── */}
        <div className="mx-auto mt-20 w-full max-w-5xl">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
            {t("dataset.sectionLabel")}
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-fg sm:text-3xl">
                {t("dataset.heading")}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                {t("dataset.p1")}
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
                {t("dataset.p2Before")}{" "}
                <span className="text-fg">{t("dataset.p2Question")}</span>{" "}
                {t("dataset.p2After")}
              </p>
              <p className="mt-2 max-w-xl text-xs text-fg-subtle">
                {t("dataset.p3")}
              </p>
            </div>
            <Link
              href="/dataset"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:bg-bg-subtle hover:text-fg"
            >
              {t("dataset.docsCta")}
            </Link>
          </div>

          {/* Mini doc cards */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHT_DOCS.map((doc) => (
              <div key={doc.file} className="rounded-xl border border-border bg-bg-subtle p-4">
                <div className={`mb-2 h-0.5 w-8 rounded-full ${doc.accent}`} />
                <p className="font-mono text-[10px] text-fg-subtle">{doc.file}</p>
                <p className="mt-1 text-sm font-medium leading-snug text-fg">{doc.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">{doc.desc}</p>
              </div>
            ))}
          </div>

          {/* Causal chain */}
          <div className="mt-8 rounded-xl border border-border bg-bg-subtle p-5 sm:p-6">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
              {t("dataset.chainLabel")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {CHAIN.map((node, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-lg border border-border bg-bg-input px-3 py-2 text-center">
                    <p className="text-xs font-medium leading-snug text-fg">{node.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-fg-subtle">{node.file}</p>
                  </div>
                  {i < CHAIN.length - 1 && (
                    <span className="text-fg-subtle">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-fg-subtle">
              {t("dataset.chainNote")}
            </p>
          </div>
        </div>

      </main>

      <footer className="border-t border-border px-4 py-5 text-center font-mono text-xs text-fg-subtle">
        {t("footer")}
      </footer>
    </div>
  );
}

// ── Static data (corpus-specific, stays in English) ──────────────────────────

const HIGHLIGHT_DOCS = [
  {
    file: "02_incident_leeds.md",
    title: "Espresso Machine Failure — Leeds Central",
    desc: "Formal incident log INC-2024-0312. The technical anchor for cross-document reasoning.",
    accent: "bg-red-500",
  },
  {
    file: "03_supplier_northbrew.md",
    title: "NorthBrew Supplies Oat Milk Disruption",
    desc: "Wakefield depot logistics failure. Documents a prior Sep 2023 incident — critical for recurrence detection.",
    accent: "bg-emerald-600",
  },
  {
    file: "04_customer_feedback.md",
    title: "Customer Feedback Summary",
    desc: "47 submissions, 61% negative. \"Watery espresso\" complaints — never explicitly linked to the valve fault.",
    accent: "bg-purple-500",
  },
  {
    file: "08_logistics_mobile.md",
    title: "Mobile Ordering Rollout Disruption",
    desc: "Orda POS modifier sync bug. Bridges the supplier thread and technology thread across the corpus.",
    accent: "bg-violet-500",
  },
];

const CHAIN = [
  { label: "Wakefield depot systems migration fails", file: "file 03" },
  { label: "40% oat milk shortfall at Leeds", file: "files 01, 03" },
  { label: "Mobile oat flat white order unfulfillable", file: "file 08" },
  { label: "Formal complaint + Google Review posted", file: "file 04" },
];

// ── Components ────────────────────────────────────────────────────────────────

function FeatureCard({ label, color, description }: {
  label: string;
  color: "indigo" | "emerald" | "amber";
  description: string;
}) {
  const badge = {
    indigo:  "border-indigo-700 bg-indigo-950/40 text-indigo-300",
    emerald: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
    amber:   "border-amber-700 bg-amber-950/40 text-amber-300",
  }[color];

  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-5 sm:p-6">
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${badge}`}>
        {label}
      </span>
      <p className="mt-3 text-sm leading-relaxed text-fg-muted">{description}</p>
    </div>
  );
}
