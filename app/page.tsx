import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
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
              GitHub →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto w-full max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-700 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300">
            Portfolio demo · AI retrieval research
          </div>

          {/* Title */}
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            Adaptive RAG
            <br className="sm:hidden" />
            {" "}Playground
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Enterprise multi-document causal reasoning across operational reports.
            Watch semantic search and graph traversal compete on the same query —
            then see the auto-router explain why it chose each method.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/playground"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-8 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-h sm:w-auto"
            >
              Try the Demo
            </Link>
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-8 text-sm font-medium text-fg-muted transition-colors hover:border-fg-subtle hover:bg-bg-subtle sm:w-auto"
            >
              View Source
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-16 grid w-full max-w-5xl grid-cols-1 gap-4 px-4 sm:mt-20 sm:grid-cols-3 sm:px-6">
          <FeatureCard
            label="Graph Traversal"
            color="indigo"
            description="BFS across 201 entities and 175 relationships extracted from 8 operational documents."
          />
          <FeatureCard
            label="Comparison Mode"
            color="emerald"
            description="Semantic and graph responses side by side — see which retrieval method wins and why."
          />
          <FeatureCard
            label="Decision Log"
            color="amber"
            description="Auto-router explains its choice: keyword signals, named entity count, and confidence."
          />
        </div>

        {/* Stats row */}
        <div className="mx-auto mt-10 flex w-full max-w-5xl flex-wrap justify-center gap-6 px-4 sm:gap-10 sm:px-6">
          {[
            { value: "201", label: "entities" },
            { value: "175", label: "relationships" },
            { value: "8", label: "documents" },
            { value: "20", label: "sample queries" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-fg sm:text-3xl">{s.value}</p>
              <p className="text-xs text-fg-subtle">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2 px-4">
          {["Next.js 16", "Claude Haiku 4.5", "Voyage AI voyage-3", "pgvector", "Supabase", "Vercel"].map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-bg-subtle px-3 py-1 font-mono text-xs text-fg-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-5 text-center font-mono text-xs text-fg-subtle">
        Built by Mustafa Barış Akverdi · Senior Oracle APEX/DBA + AI developer · Reading, UK
      </footer>
    </div>
  );
}

function FeatureCard({
  label,
  color,
  description,
}: {
  label: string;
  color: "indigo" | "emerald" | "amber";
  description: string;
}) {
  const badge = {
    indigo: "border-indigo-700 bg-indigo-950/40 text-indigo-300",
    emerald: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
    amber: "border-amber-700 bg-amber-950/40 text-amber-300",
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
