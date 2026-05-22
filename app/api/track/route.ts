import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendNewVisitorEmail } from "@/lib/email";

const WHITELIST = [
  "127.0.0.1",
  "::1",
  ...(process.env.ANALYTICS_WHITELIST_IPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
];

const BOT_PATTERN = /bot|crawler|spider|slurp|facebookexternalhit|headless/i;

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (WHITELIST.includes(ip)) return NextResponse.json({ ok: true });

    const body = await req.json();
    const { path, locale, userAgent } = body as {
      path: string;
      locale: string;
      userAgent: string;
    };

    if (userAgent && BOT_PATTERN.test(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    // Check if this IP has visited before
    const { count } = await getSupabase()
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip);
    const isNewVisitor = count === 0;

    // Geo lookup
    let country: string | null = null;
    let city: string | null = null;
    let region: string | null = null;
    let org: string | null = null;

    try {
      const geoRes = await fetch(`https://ipinfo.io/${ip}/json`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      });
      if (geoRes.ok) {
        const data = await geoRes.json();
        country = data.country ?? null;
        city = data.city ?? null;
        region = data.region ?? null;
        org = data.org ?? null;
      }
    } catch {
      // geo lookup optional
    }

    await getSupabase().from("analytics_events").insert({
      ip,
      path,
      locale,
      user_agent: userAgent,
      country,
      city,
      region,
      org,
    });

    if (isNewVisitor) {
      // fire-and-forget, don't await
      sendNewVisitorEmail({ ip, country, city, region, org, path, locale, userAgent }).catch(
        () => {}
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
