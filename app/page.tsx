import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-500 sm:text-sm">
            rag.barisakverdi.com
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 sm:text-sm"
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            Portfolio demo · AI retrieval research
          </div>

          {/* Title */}
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
            Adaptive RAG
            <br className="sm:hidden" />
            {" "}Playground
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Enterprise multi-document causal reasoning across operational reports.
            Watch semantic search and graph traversal compete on the same query —
            then see the auto-router explain why it chose each method.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/playground"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 sm:w-auto"
            >
              Try the Demo
            </Link>
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-zinc-300 px-8 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50 sm:w-auto"
            >
              View Source
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-16 grid w-full max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6 sm:mt-20">
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
              <p className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">{s.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2 px-4">
          {["Next.js 16", "Claude Haiku 4.5", "Voyage AI voyage-3", "pgvector", "Supabase", "Vercel"].map((t) => (
            <span
              key={t}
              className="rounded-md border border-zinc-200 bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 px-4 py-5 text-center font-mono text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
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
  const light = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  const dark = {
    indigo: "dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
    emerald: "dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber: "dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  };
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-6">
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${light[color]} ${dark[color]}`}>
        {label}
      </span>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
