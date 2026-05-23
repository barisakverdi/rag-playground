import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ArchitectureModal } from "@/components/ArchitectureModal";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Availability banner */}
      <div className="border-b border-amber-900/30 bg-amber-950/20 px-4 py-2 text-center">
        <p className="text-xs text-fg-muted">
          {t("availableBanner")}
          <a
            href="mailto:barisakverdi@hotmail.com"
            className="ml-2 font-medium text-accent transition-colors hover:text-accent-h"
          >
            {t("availableCta")}
          </a>
        </p>
      </div>

      {/* Nav */}
      <nav className="border-b border-border px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-mono text-xs text-fg-subtle sm:text-sm">
            rag.barisakverdi.com
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <a
              href="https://www.linkedin.com/in/mustafa-baris-akverdi-a5366012/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-fg-muted transition-colors hover:text-fg sm:text-sm"
            >
              {t("linkedinLink")}
            </a>
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

      {/* Canvas grid wrapper */}
      <div className="relative flex-1">
        {/* Vertical guide lines — only visible when viewport is wider than container */}
        <div
          className="pointer-events-none absolute inset-0 mx-auto hidden max-w-5xl border-x border-border-dim lg:block"
          aria-hidden="true"
        />

        {/* ── Hero ── */}
        <section className="border-b border-border-dim px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto w-full max-w-5xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-700 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300">
              {t("badge")}
            </div>
            {/* 3/5 + 2/5 split */}
            <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-5 lg:gap-16">
              {/* Left: headline + subtitle */}
              <div className="sm:col-span-3">
                <h1 className="text-balance text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-6xl">
                  {t("title")}
                </h1>
                <p className="mt-4 max-w-sm text-pretty text-base leading-relaxed text-fg-muted sm:text-lg">
                  {t("subtitle")}
                </p>
              </div>
              {/* Right: context + CTAs */}
              <div className="sm:col-span-2">
                <p className="text-pretty text-sm leading-relaxed text-fg-subtle">
                  {t("heroContext")}
                </p>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-fg-muted">
                  {t("heroCorpusTeaser")}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/playground"
                    className="inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-h sm:w-auto"
                  >
                    {t("tryDemo")}
                  </Link>
                  <ArchitectureModal label={t("dataset.architectureCta")} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature cards + Compare preview ── */}
        <section className="border-b border-border-dim px-4 py-16 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FeatureCard label={t("features.graphLabel")}    color="indigo"  description={t("features.graphDesc")} />
              <FeatureCard label={t("features.compareLabel")}  color="emerald" description={t("features.compareDesc")} />
              <FeatureCard label={t("features.decisionLabel")} color="amber"   description={t("features.decisionDesc")} />
            </div>

            {/* Compare mode preview */}
            <div className="mt-10">
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
                  {t("comparePreview.label")}
                </span>
                <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-fg-subtle">
                  {t("comparePreview.sampleBadge")}
                </span>
              </div>
              <div className="overflow-hidden rounded-xl border border-border bg-bg-subtle">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                  <span className="font-mono text-[10px] text-fg-subtle">{t("comparePreview.routerLabel")}</span>
                  <span className="rounded border border-indigo-700 bg-indigo-950/50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-indigo-300">
                    graph
                  </span>
                  <span className="font-mono text-[10px] text-fg-subtle">{t("comparePreview.routerReason")}</span>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded border border-emerald-700 bg-emerald-950/50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-300">
                        semantic
                      </span>
                      <span className="font-mono text-[10px] text-fg-subtle">3 docs retrieved</span>
                    </div>
                    <p className="text-xs leading-relaxed text-fg-muted">
                      NorthBrew Supplies experienced delays at the Wakefield depot in early Q1, impacting oat milk deliveries to North England branches. Customer feedback noted supply-related complaints across several locations.
                    </p>
                    <p className="mt-3 font-mono text-[10px] text-emerald-600/70">files: 01, 03, 07</p>
                    <p className="mt-1 font-mono text-[10px] text-fg-subtle">{t("comparePreview.semanticNote")}</p>
                  </div>
                  <div className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded border border-indigo-700 bg-indigo-950/50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-indigo-300">
                        graph
                      </span>
                      <span className="font-mono text-[10px] text-fg-subtle">4 docs · 2 hops</span>
                    </div>
                    <p className="text-xs leading-relaxed text-fg-muted">
                      The Wakefield depot systems migration (file 03) caused a 40% oat milk shortfall at Leeds. This made the oat flat white unfulfillable via mobile ordering (file 08), generating a formal complaint and a negative Google Review (file 04).
                    </p>
                    <p className="mt-3 font-mono text-[10px] text-indigo-400/70">files: 01, 03, <span className="font-semibold text-indigo-300">04</span>, <span className="font-semibold text-indigo-300">08</span></p>
                    <p className="mt-1 font-mono text-[10px] text-indigo-400/70">{t("comparePreview.graphNote")}</p>
                  </div>
                </div>
                <div className="border-t border-border px-4 py-3">
                  <p className="font-mono text-[10px] text-indigo-300/80">
                    ↳ {t("comparePreview.diffNote")}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-fg-subtle">
                {t("comparePreview.caption")}
              </p>
            </div>
          </div>
        </section>

        {/* ── Stats + Tech stack ── */}
        <section className="border-b border-border-dim px-4 py-16 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
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
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["Next.js 16", "Claude Haiku 4.5", "Voyage AI voyage-3", "pgvector", "Supabase", "Vercel"].map((tech) => (
                <span key={tech} className="rounded-md border border-border bg-bg-subtle px-3 py-1 font-mono text-xs text-fg-muted">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Certifications ── */}
        <section className="border-b border-border-dim px-4 py-16 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
              {t("certLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {CERTS.map((cert) =>
                cert.url ? (
                  <a
                    key={cert.name}
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors hover:border-fg-subtle hover:text-fg"
                  >
                    <span className="text-emerald-400">✓</span>
                    {cert.name}
                    <span className="text-[10px] text-fg-subtle">↗</span>
                  </a>
                ) : (
                  <span
                    key={cert.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-bg-subtle px-3 py-1.5 font-mono text-xs text-fg-muted"
                  >
                    <span className="text-emerald-400">✓</span>
                    {cert.name}
                  </span>
                )
              )}
            </div>
            <p className="mt-3 font-mono text-[10px] text-fg-subtle">
              {t("certBuiltWith")}
            </p>
          </div>
        </section>

        {/* ── About the corpus ── */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
              {t("dataset.sectionLabel")}
            </div>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-balance text-2xl font-bold text-fg sm:text-3xl">
                  {t("dataset.heading")}
                </h2>
                <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-fg-muted">
                  {t("dataset.p1")}
                </p>
                <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-fg-muted">
                  {t("dataset.p2Before")}{" "}
                  <span className="text-fg">{t("dataset.p2Question")}</span>{" "}
                  {t("dataset.p2After")}
                </p>
                <p className="mt-2 max-w-xl text-pretty text-xs text-fg-subtle">
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
        </section>
      </div>

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

const CERTS = [
  { name: "Introduction to Agent Skills",           url: null },
  { name: "Claude with the Anthropic API",          url: "https://verify.skilljar.com/c/uykazt5g3r7x" },
  { name: "Introduction to Model Context Protocol", url: "https://verify.skilljar.com/c/pg3cd6xa22z7" },
  { name: "Claude Code in Action",                  url: "https://verify.skilljar.com/c/5fee8di8fe9k" },
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
      <p className="mt-3 text-pretty text-sm leading-relaxed text-fg-muted">{description}</p>
    </div>
  );
}
