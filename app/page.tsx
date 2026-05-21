import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-mono text-sm text-zinc-400">rag.barisakverdi.com</span>
          <a
            href="https://github.com/barisakverdi/rag-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            GitHub →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-800 bg-indigo-950/50 px-3 py-1 text-xs text-indigo-300">
            Portfolio demo · AI retrieval research
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-zinc-50">
            Adaptive RAG Playground
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-zinc-400">
            Enterprise multi-document causal reasoning across operational reports.
            Watch semantic search and graph traversal compete on the same query —
            then see the auto-router explain why it chose each method.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/playground"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Try the Demo
            </Link>
            <a
              href="https://github.com/barisakverdi/rag-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-700 px-8 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              View Source
            </a>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
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

        {/* Stack */}
        <div className="mx-auto mt-16 flex max-w-2xl flex-wrap justify-center gap-2">
          {[
            "Next.js 16",
            "Claude Haiku 4.5",
            "Voyage AI voyage-3",
            "pgvector",
            "Supabase",
            "Vercel",
          ].map((t) => (
            <span
              key={t}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 font-mono text-xs text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6 text-center font-mono text-xs text-zinc-600">
        Built by Mustafa Barış Akverdi · Senior Oracle APEX/DBA + AI-native developer · Reading, UK
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
  const colors = {
    indigo: "border-indigo-800 bg-indigo-950/30 text-indigo-300",
    emerald: "border-emerald-800 bg-emerald-950/30 text-emerald-300",
    amber: "border-amber-800 bg-amber-950/30 text-amber-300",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${colors[color]}`}>
        {label}
      </span>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}
