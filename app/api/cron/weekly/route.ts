import { type NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendWeeklySummaryEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  // Only allow Vercel cron (identified by user-agent) or localhost
  const userAgent = req.headers.get("user-agent") ?? "";
  const host = req.headers.get("host") ?? "";
  const isVercelCron = userAgent.includes("vercel-cron");
  const isLocal = host.includes("localhost");
  if (!isVercelCron && !isLocal) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const { data: weekEvents } = await getSupabase()
    .from("analytics_events")
    .select("*")
    .gte("created_at", weekAgo.toISOString())
    .order("created_at", { ascending: false });

  const { data: prevWeekEvents } = await getSupabase()
    .from("analytics_events")
    .select("ip")
    .gte("created_at", twoWeeksAgo.toISOString())
    .lt("created_at", weekAgo.toISOString());

  const events = weekEvents ?? [];
  const prevIPs = new Set((prevWeekEvents ?? []).map((e) => e.ip));

  const uniqueIPs = new Set(events.map((e) => e.ip));
  const newIPs = [...uniqueIPs].filter((ip) => !prevIPs.has(ip)).length;

  const byCountry: Record<string, number> = {};
  const byPage: Record<string, number> = {};
  for (const e of events) {
    const c = e.country ?? "Unknown";
    byCountry[c] = (byCountry[c] ?? 0) + 1;
    const p = e.path ?? "/";
    byPage[p] = (byPage[p] ?? 0) + 1;
  }

  const recentVisitors = events.slice(0, 20).map((e) => ({
    ip: e.ip,
    location: [e.city, e.region, e.country].filter(Boolean).join(", ") || "Unknown",
    org: e.org ?? null,
    path: e.path ?? "/",
    time: new Date(e.created_at).toISOString().replace("T", " ").slice(0, 16),
  }));

  await sendWeeklySummaryEmail({
    totalVisits: events.length,
    uniqueIPs: uniqueIPs.size,
    newIPs,
    topCountries: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 8),
    topPages: Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 8),
    recentVisitors,
    weekStart: weekAgo.toISOString().slice(0, 10),
    weekEnd: now.toISOString().slice(0, 10),
  });

  return NextResponse.json({ ok: true, visits: events.length });
}
