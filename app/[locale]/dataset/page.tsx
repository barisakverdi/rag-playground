import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function DatasetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Dataset" });

  return (
    <div className="flex min-h-screen flex-col bg-bg">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
            <Link href="/" className="shrink-0 font-mono text-xs text-fg-subtle transition-colors hover:text-fg">
              {t("navHome")}
            </Link>
            <div className="h-3 w-px shrink-0 bg-border" />
            {[
              { href: "#corpus",      label: t("navCorpus") },
              { href: "#causal",      label: t("navCausal") },
              { href: "#entities",    label: t("navEntities") },
              { href: "#queries",     label: t("navQueries") },
              { href: "#challenges",  label: t("navDesign") },
              { href: "#methodology", label: t("navMethodology") },
            ].map((l) => (
              <a key={l.href} href={l.href} className="shrink-0 font-mono text-xs uppercase tracking-widest text-fg-subtle transition-colors hover:text-fg">
                {l.label}
              </a>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6">

        {/* ── Hero ── */}
        <section className="py-16 sm:py-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded border border-border bg-bg-subtle px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
            {t("badge")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-fg sm:text-5xl">
            {t("title")} <span className="text-accent">{t("titleAccent")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-muted">
            {t("subtitle")}
          </p>
          <p className="mt-2 max-w-xl text-sm text-fg-subtle">
            {t("methodologyNote")}
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            {[
              { n: "8",     l: t("stats.corpusFiles") },
              { n: "5,100", l: t("stats.words") },
              { n: "20",    l: t("stats.demoQueries") },
              { n: "201",   l: t("stats.entities") },
              { n: "175",   l: t("stats.relationships") },
              { n: "12",    l: t("stats.recurringEntities") },
            ].map((s) => (
              <div key={s.l} className="flex flex-col gap-0.5">
                <span className="text-2xl font-bold text-accent sm:text-3xl">{s.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Corpus ── */}
        <section id="corpus" className="py-14">
          <SectionLabel index="01" />
          <h2 className="mb-8 text-2xl font-bold text-fg sm:text-3xl">{t("corpusTitle")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DOCS.map((doc) => (
              <div key={doc.file} className="relative overflow-hidden rounded-xl border border-border bg-bg-subtle p-5 transition-colors hover:border-fg-subtle">
                <div className={`absolute left-0 top-0 h-0.5 w-full ${doc.accentBar}`} />
                <p className="font-mono text-[10px] text-fg-subtle">{doc.file}</p>
                <p className="mt-1.5 text-sm font-semibold leading-snug text-fg">{doc.title}</p>
                <span className={`mt-2 inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${doc.typeBadge}`}>
                  {t(`docTypes.${doc.typeKey}` as any)}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-fg-muted">{doc.desc}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-border bg-bg-input px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Causal chain ── */}
        <section id="causal" className="py-14">
          <SectionLabel index="02" />
          <h2 className="mb-3 text-2xl font-bold text-fg sm:text-3xl">{t("causalTitle")}</h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-fg-muted">{t("causalDesc")}</p>
          <div className="rounded-xl border border-border bg-bg-subtle p-5 sm:p-8">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
              {t("causalChainLabel")}
            </p>
            <div className="flex flex-wrap items-start gap-3">
              {CHAIN.map((node, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="rounded-lg border border-border bg-bg-input p-3 text-center" style={{ minWidth: "130px" }}>
                    <p className="text-xs font-semibold leading-snug text-fg">{node.label}</p>
                    <p className="mt-1 font-mono text-[10px] text-fg-subtle">{node.file}</p>
                  </div>
                  {i < CHAIN.length - 1 && (
                    <span className="mt-4 text-lg font-light text-accent">→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-lg border border-border bg-bg-input px-4 py-3 text-xs leading-relaxed text-fg-muted">
              <span className="font-semibold text-fg">{t("causalWhyMatters")}</span>{" "}
              {t("causalWhyBody")}
            </p>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Entity map ── */}
        <section id="entities" className="py-14">
          <SectionLabel index="03" />
          <h2 className="mb-3 text-2xl font-bold text-fg sm:text-3xl">{t("entityTitle")}</h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-fg-muted">{t("entityDesc")}</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-subtle">
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{t("entityColEntity")}</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{t("entityColType")}</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{t("entityColFiles")}</th>
                </tr>
              </thead>
              <tbody>
                {ENTITIES.map((e, i) => (
                  <tr key={e.name} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-bg-subtle/40"}`}>
                    <td className="px-4 py-3 font-semibold text-fg">{e.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-border bg-bg-input px-2 py-0.5 font-mono text-[10px] text-fg-subtle">
                        {t(`entityTypes.${e.typeKey}` as any)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {e.files.map((f) => (
                          <span key={f} className="rounded bg-bg-input px-2 py-0.5 font-mono text-[11px] font-medium text-fg">{f}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Queries ── */}
        <section id="queries" className="py-14">
          <SectionLabel index="04" />
          <h2 className="mb-3 text-2xl font-bold text-fg sm:text-3xl">{t("queriesTitle")}</h2>
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-fg-muted">{t("queriesDesc")}</p>
          <div className="flex flex-col gap-10">
            {QUERY_GROUPS(t).map((group) => (
              <div key={group.label}>
                <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${group.dot}`} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{group.label}</span>
                </div>
                <ul className="flex flex-col gap-2">
                  {group.queries.map((q) => (
                    <li key={q.n} className="flex gap-3 rounded-lg border border-border bg-bg-subtle px-4 py-3 transition-colors hover:border-fg-subtle hover:bg-bg-input">
                      <span className="shrink-0 pt-0.5 font-mono text-xs font-medium text-accent">{String(q.n).padStart(2, "0")}</span>
                      <span className="text-sm leading-snug text-fg-muted">{q.q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Retrieval design ── */}
        <section id="challenges" className="py-14">
          <SectionLabel index="05" />
          <h2 className="mb-3 text-2xl font-bold text-fg sm:text-3xl">{t("challengesTitle")}</h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-fg-muted">{t("challengesDesc")}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHALLENGE_KEYS.map((key) => (
              <div key={key} className="rounded-xl border border-border bg-bg-subtle p-5">
                <div className="mb-3 text-2xl">{CHALLENGE_ICONS[key]}</div>
                <h3 className="mb-2 text-sm font-semibold text-fg">{t(`challenges.${key}.title` as any)}</h3>
                <p className="mb-3 text-xs leading-relaxed text-fg-muted">{t(`challenges.${key}.desc` as any)}</p>
                <div className="rounded-lg border-l-2 border-accent bg-bg-input px-3 py-2 text-xs italic leading-relaxed text-fg-muted">
                  {t(`challenges.${key}.example` as any)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-border" />

        {/* ── Methodology ── */}
        <section id="methodology" className="py-14">
          <SectionLabel index="06" />
          <h2 className="mb-3 text-2xl font-bold text-fg sm:text-3xl">{t("methodologyTitle")}</h2>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-fg-muted">{t("methodologyDesc")}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {METHODOLOGY_KEYS.map(({ key, badge }) => (
              <div key={key} className="rounded-xl border border-border bg-bg-subtle p-5">
                <div className={`mb-3 inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${badge}`}>
                  {t(`methodology.${key}.tag` as any)}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-fg">{t(`methodology.${key}.heading` as any)}</h3>
                <p className="text-xs leading-relaxed text-fg-muted">{t(`methodology.${key}.body` as any)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border bg-bg-subtle p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-semibold text-fg">{t("ctaHeading")}</p>
            <p className="mt-1 text-sm text-fg-muted">{t("ctaDesc")}</p>
          </div>
          <Link
            href="/playground"
            className="inline-flex shrink-0 h-10 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-h"
          >
            {t("ctaButton")}
          </Link>
        </div>

      </main>

      <footer className="border-t border-border px-4 py-5 text-center font-mono text-xs text-fg-subtle">
        {t("footer")}
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ index }: { index: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{index}</span>
      <div className="h-px w-10 bg-border" />
    </div>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────

const CHAIN = [
  { label: "Wakefield depot systems migration fails", file: "file 03" },
  { label: "40% oat milk shortfall at Leeds Central", file: "files 01, 03" },
  { label: "Mobile oat flat white order unfulfillable", file: "file 08" },
  { label: "Formal complaint + Google Review posted", file: "file 04" },
];

const DOCS = [
  { file: "01_north_regional_ops_report.md",       title: "North England Regional Operations Report — March 2024", typeKey: "ops",         typeBadge: "border-amber-800 bg-amber-950/40 text-amber-300",    accentBar: "bg-accent",    desc: "Sarah Mitchell's overview of Leeds Central and Manchester Piccadilly. The entry-point document that surfaces the core problem cluster without fully explaining any single issue.", tags: ["Leeds","Manchester","NorthBrew","oat milk","Bar 2"] },
  { file: "02_incident_leeds_espresso_failure.md",  title: "Incident Report — Espresso Machine Failure, Leeds Central", typeKey: "incident",    typeBadge: "border-red-800 bg-red-950/40 text-red-300",          accentBar: "bg-red-600",   desc: "Formal incident log INC-2024-0312 by duty manager Daniel Park. Precise timeline of the Bar 2 valve failure. Key technical anchor for cross-document reasoning.", tags: ["INC-2024-0312","La Marzocca","Marcus Webb","valve seal"] },
  { file: "03_supplier_northbrew_oat_milk.md",      title: "Supplier Update — NorthBrew Supplies Oat Milk Disruption", typeKey: "supplier",    typeBadge: "border-emerald-800 bg-emerald-950/40 text-emerald-300", accentBar: "bg-emerald-600", desc: "Dominic Ferrara's account of the Wakefield depot logistics failure. Documents a previous Sep 2023 incident — critical for establishing recurrence.", tags: ["NorthBrew","Wakefield","Dominic Ferrara","GreenLeaf"] },
  { file: "04_customer_feedback_north.md",          title: "Customer Feedback Summary — Leeds & Manchester",          typeKey: "feedback",    typeBadge: "border-purple-800 bg-purple-950/40 text-purple-300",  accentBar: "bg-purple-600", desc: "Amara Osei's March compilation. 47 submissions, 62% negative. Connects \"watery espresso\" to equipment faults — without naming the root cause.", tags: ["Amara Osei","espresso quality","mobile ordering","61.7% negative"] },
  { file: "05_staffing_issues_north.md",            title: "Staffing Issues Report — North Region, Q1 2024",         typeKey: "staffing",    typeBadge: "border-sky-800 bg-sky-950/40 text-sky-300",          accentBar: "bg-sky-600",   desc: "Sarah Mitchell & HR partner Gemma Holroyd's Q1 assessment. Tom Okafor resigned, Priya Nair transferred. Identifies pay gap and shift patterns as structural drivers.", tags: ["Tom Okafor","Priya Nair","Gemma Holroyd","Sheffield"] },
  { file: "06_maintenance_report_north.md",         title: "Maintenance Report — North England Branches, March 2024", typeKey: "maintenance",  typeBadge: "border-orange-800 bg-orange-950/40 text-orange-300", accentBar: "bg-orange-500", desc: "Marcus Webb's technical log. Confirms the same valve failure class at both Leeds and Manchester — a pattern invisible in any other single document.", tags: ["Marcus Webb","BP-LC-EM02","solenoid valve","boiler"] },
  { file: "07_regional_performance_q1_north.md",    title: "Regional Performance Summary — North England Q1 2024",    typeKey: "performance", typeBadge: "border-zinc-700 bg-zinc-800/40 text-zinc-300",       accentBar: "bg-zinc-500",  desc: "KPI review: Leeds CSS dropped 3.8→3.1 (steepest recorded decline). Manchester mobile adoption 23% but 18% complaint rate weeks 1–2. Sheffield as control case.", tags: ["CSS 3.1","transactions -13%","Sheffield +2%","Q1"] },
  { file: "08_logistics_mobile_ordering_disruption.md", title: "Logistics & Technology Disruption — Mobile Ordering Rollout", typeKey: "logistics", typeBadge: "border-violet-800 bg-violet-950/40 text-violet-300", accentBar: "bg-violet-600", desc: "Lena Frost's post-implementation analysis. Documents the Orda POS modifier sync bug and its 2-week fix lag. Bridge document linking supplier to technology thread.", tags: ["Lena Frost","Orda POS","modifier sync","oat milk bug"] },
];

const ENTITIES = [
  { name: "NorthBrew Supplies",       typeKey: "supplier",   files: ["01","03","04","07","08"] },
  { name: "Sarah Mitchell",           typeKey: "person",     files: ["01","02","03","05","06","07"] },
  { name: "Leeds Central",            typeKey: "branch",     files: ["01","02","03","04","05","06","07","08"] },
  { name: "Manchester Piccadilly",    typeKey: "branch",     files: ["01","04","06","07","08"] },
  { name: "Espresso machine failure", typeKey: "incident",   files: ["01","02","04","06","07"] },
  { name: "Oat milk shortage",        typeKey: "supply",     files: ["01","02","03","04","07","08"] },
  { name: "Mobile ordering rollout",  typeKey: "technology", files: ["01","04","05","07","08"] },
  { name: "Staffing shortage",        typeKey: "hr",         files: ["01","04","05","07"] },
  { name: "Marcus Webb",              typeKey: "person",     files: ["02","06"] },
  { name: "Dominic Ferrara",          typeKey: "person",     files: ["03","07","08"] },
  { name: "Amara Osei",               typeKey: "person",     files: ["04","07"] },
  { name: "James Rowley",             typeKey: "person",     files: ["01","08"] },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QUERY_GROUPS = (t: any) => [
  { label: t("queryGroupSupplier"), dot: "bg-emerald-500", queries: [
    { n: 1,  q: "Which operational issues were directly caused or worsened by the NorthBrew Supplies disruption?" },
    { n: 2,  q: "What branches were affected by the oat milk shortage, and what were the downstream consequences at each?" },
    { n: 3,  q: "Has NorthBrew Supplies caused supply problems before, and how does the March 2024 situation compare?" },
    { n: 4,  q: "What steps has BrewPulse taken to reduce dependency on NorthBrew Supplies?" },
  ]},
  { label: t("queryGroupEquipment"), dot: "bg-amber-500", queries: [
    { n: 5,  q: "Which branches experienced espresso machine failures, and what is the common root cause?" },
    { n: 6,  q: "What is the relationship between the Leeds Central and Manchester Piccadilly equipment faults?" },
    { n: 7,  q: "Are the espresso machine issues at Leeds and Manchester likely to recur at other branches?" },
    { n: 8,  q: "What maintenance actions are currently outstanding and which carry the highest operational risk?" },
  ]},
  { label: t("queryGroupMobile"), dot: "bg-violet-500", queries: [
    { n: 9,  q: "What problems emerged after the mobile ordering system launched in North England?" },
    { n: 10, q: "Why did the oat milk ordering bug take two weeks to fix, and what was the customer impact?" },
    { n: 11, q: "How did the timing of the mobile ordering rollout interact with other operational problems?" },
    { n: 12, q: "What should be done differently before the Midlands cohort rollout in May?" },
  ]},
  { label: t("queryGroupStaffing"), dot: "bg-sky-500", queries: [
    { n: 13, q: "Which branches had staffing shortages in Q1 2024, and what caused them?" },
    { n: 14, q: "How did understaffing at Leeds Central compound the impact of the equipment failure?" },
    { n: 15, q: "What is the risk to Easter trading given current headcount levels?" },
  ]},
  { label: t("queryGroupCx"), dot: "bg-orange-500", queries: [
    { n: 16, q: "Which cities mentioned both staffing shortages and customer complaints in the same period?" },
    { n: 17, q: "What is the connection between the espresso machine fault and customer complaints about drink quality?" },
    { n: 18, q: "Which customer complaints can be traced back to a supplier issue rather than a branch-level failure?" },
  ]},
  { label: t("queryGroupCross"), dot: "bg-red-500", queries: [
    { n: 19, q: "If you were the Head of Operations reviewing Q1 2024, what would you identify as the single most important systemic risk to address?" },
    { n: 20, q: "Trace the full chain of events from the NorthBrew Supplies Wakefield depot failure through to the Google Reviews complaints at Leeds Central." },
  ]},
];

const CHALLENGE_KEYS = ["indirect", "multiHop", "attribution", "timeline", "partial", "control"] as const;
const CHALLENGE_ICONS: Record<string, string> = {
  indirect: "🔗", multiHop: "⛓️", attribution: "❓", timeline: "📅", partial: "🧩", control: "🏆",
};

const METHODOLOGY_KEYS = [
  { key: "gen", badge: "border-indigo-700 bg-indigo-950/40 text-indigo-300" },
  { key: "cur", badge: "border-emerald-700 bg-emerald-950/40 text-emerald-300" },
  { key: "ext", badge: "border-amber-700 bg-amber-950/40 text-amber-300" },
  { key: "emb", badge: "border-violet-700 bg-violet-950/40 text-violet-300" },
] as const;
