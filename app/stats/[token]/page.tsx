import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Event = {
  id: string;
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  org: string | null;
  path: string | null;
  locale: string | null;
  user_agent: string | null;
  created_at: string;
};

export default async function StatsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (token !== process.env.ANALYTICS_SECRET_TOKEN) {
    notFound();
  }

  const { data: events, error } = await getSupabase()
    .from("analytics_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="p-8 font-mono text-sm text-red-400">
        DB error: {error.message}
      </div>
    );
  }

  const rows = (events ?? []) as Event[];

  // Aggregate by country
  const byCountry: Record<string, number> = {};
  for (const e of rows) {
    const c = e.country ?? "Unknown";
    byCountry[c] = (byCountry[c] ?? 0) + 1;
  }
  const countrySorted = Object.entries(byCountry).sort((a, b) => b[1] - a[1]);

  const uniqueIPs = new Set(rows.map((e) => e.ip)).size;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 font-mono text-sm text-white">
      <h1 className="mb-6 text-lg font-bold text-white">
        rag.barisakverdi.com — Visitor Log
      </h1>

      {/* Summary */}
      <div className="mb-6 flex gap-8">
        <div>
          <div className="text-[#6366f1] text-xs uppercase tracking-widest">Total Events</div>
          <div className="text-2xl font-bold">{rows.length}</div>
        </div>
        <div>
          <div className="text-[#6366f1] text-xs uppercase tracking-widest">Unique IPs</div>
          <div className="text-2xl font-bold">{uniqueIPs}</div>
        </div>
        <div>
          <div className="text-[#6366f1] text-xs uppercase tracking-widest">Countries</div>
          <div className="text-2xl font-bold">{countrySorted.length}</div>
        </div>
      </div>

      {/* By country */}
      {countrySorted.length > 0 && (
        <div className="mb-8">
          <div className="mb-2 text-xs uppercase tracking-widest text-[#6366f1]">By Country</div>
          <div className="flex flex-wrap gap-2">
            {countrySorted.map(([country, count]) => (
              <span
                key={country}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs"
              >
                {country} <span className="text-white/50">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event table */}
      <div className="overflow-x-auto">
        <div className="mb-2 text-xs uppercase tracking-widest text-[#6366f1]">Recent Visitors</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-white/40">
              <th className="pb-2 pr-4">Time</th>
              <th className="pb-2 pr-4">IP</th>
              <th className="pb-2 pr-4">Location</th>
              <th className="pb-2 pr-4">Org / ISP</th>
              <th className="pb-2 pr-4">Path</th>
              <th className="pb-2">Locale</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const date = new Date(e.created_at);
              const location = [e.city, e.region, e.country].filter(Boolean).join(", ");
              return (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-1.5 pr-4 text-white/50">
                    {date.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="py-1.5 pr-4 text-white/70">{e.ip}</td>
                  <td className="py-1.5 pr-4">{location || "—"}</td>
                  <td className="py-1.5 pr-4 text-white/60 max-w-[200px] truncate">
                    {e.org ?? "—"}
                  </td>
                  <td className="py-1.5 pr-4 text-[#6366f1]">{e.path ?? "—"}</td>
                  <td className="py-1.5 text-white/50">{e.locale ?? "—"}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-white/30">
                  No visitors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
