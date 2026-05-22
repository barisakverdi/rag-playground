import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "RAG Analytics <onboarding@resend.dev>";

export async function sendNewVisitorEmail(data: {
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  org: string | null;
  path: string;
  locale: string;
  userAgent: string;
}) {
  const TO = process.env.NOTIFICATION_EMAIL ?? "";
  if (!TO || !process.env.RESEND_API_KEY) return;

  const location = [data.city, data.region, data.country].filter(Boolean).join(", ") || "Unknown";
  const time = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  await getResend().emails.send({
    from: FROM,
    to: TO,
    subject: `New visitor — ${location}`,
    html: `
<div style="font-family:monospace;background:#0a0a0a;color:#fff;padding:24px;border-radius:8px;max-width:480px">
  <div style="color:#6366f1;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px">rag.barisakverdi.com — New Visitor</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <tr><td style="color:#999;padding:4px 12px 4px 0;width:80px">Time</td><td>${time}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0">IP</td><td>${data.ip}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0">Location</td><td>${location}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0">Org / ISP</td><td>${data.org ?? "—"}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0">Page</td><td style="color:#6366f1">${data.path}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0">Locale</td><td>${data.locale}</td></tr>
    <tr><td style="color:#999;padding:4px 12px 4px 0;vertical-align:top">Browser</td><td style="color:#555;font-size:11px;word-break:break-all">${data.userAgent}</td></tr>
  </table>
  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #222;font-size:11px;color:#444">
    <a href="https://rag.barisakverdi.com/stats/${process.env.ANALYTICS_SECRET_TOKEN}" style="color:#6366f1">View all stats →</a>
  </div>
</div>`,
  });
}

export async function sendWeeklySummaryEmail(data: {
  totalVisits: number;
  uniqueIPs: number;
  newIPs: number;
  topCountries: [string, number][];
  topPages: [string, number][];
  recentVisitors: {
    ip: string;
    location: string;
    org: string | null;
    path: string;
    time: string;
  }[];
  weekStart: string;
  weekEnd: string;
}) {
  const TO = process.env.NOTIFICATION_EMAIL ?? "";
  if (!TO || !process.env.RESEND_API_KEY) return;

  const countryRows = data.topCountries
    .map(([c, n]) => `<tr><td style="padding:3px 12px 3px 0;color:#999">${c}</td><td>${n}</td></tr>`)
    .join("");

  const pageRows = data.topPages
    .map(([p, n]) => `<tr><td style="padding:3px 12px 3px 0;color:#6366f1">${p}</td><td style="color:#999">${n}</td></tr>`)
    .join("");

  const visitorRows = data.recentVisitors
    .slice(0, 20)
    .map(
      (v) =>
        `<tr style="border-bottom:1px solid #1a1a1a">
          <td style="padding:4px 10px 4px 0;color:#555;font-size:11px">${v.time}</td>
          <td style="padding:4px 10px 4px 0;color:#999">${v.ip}</td>
          <td style="padding:4px 10px 4px 0">${v.location}</td>
          <td style="padding:4px 10px 4px 0;color:#555;max-width:160px;overflow:hidden">${v.org ?? "—"}</td>
          <td style="padding:4px 0;color:#6366f1">${v.path}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM,
    to: TO,
    subject: `Weekly summary — ${data.totalVisits} visits, ${data.newIPs} new`,
    html: `
<div style="font-family:monospace;background:#0a0a0a;color:#fff;padding:24px;border-radius:8px;max-width:600px">
  <div style="color:#6366f1;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">rag.barisakverdi.com</div>
  <div style="font-size:13px;color:#666;margin-bottom:20px">${data.weekStart} — ${data.weekEnd}</div>

  <div style="display:flex;gap:32px;margin-bottom:24px">
    <div><div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase">Total Visits</div><div style="font-size:28px;font-weight:bold">${data.totalVisits}</div></div>
    <div><div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase">Unique IPs</div><div style="font-size:28px;font-weight:bold">${data.uniqueIPs}</div></div>
    <div><div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase">New This Week</div><div style="font-size:28px;font-weight:bold">${data.newIPs}</div></div>
  </div>

  <div style="display:flex;gap:32px;margin-bottom:24px">
    <div>
      <div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">By Country</div>
      <table style="font-size:13px">${countryRows || "<tr><td style='color:#555'>No data</td></tr>"}</table>
    </div>
    <div>
      <div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">By Page</div>
      <table style="font-size:13px">${pageRows || "<tr><td style='color:#555'>No data</td></tr>"}</table>
    </div>
  </div>

  ${
    visitorRows
      ? `<div style="margin-bottom:16px">
    <div style="color:#6366f1;font-size:10px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Recent Visitors</div>
    <table style="width:100%;font-size:12px;border-collapse:collapse">${visitorRows}</table>
  </div>`
      : ""
  }

  <div style="margin-top:16px;padding-top:16px;border-top:1px solid #222;font-size:11px;color:#444">
    <a href="https://rag.barisakverdi.com/stats/${process.env.ANALYTICS_SECRET_TOKEN}" style="color:#6366f1">View full stats →</a>
  </div>
</div>`,
  });
}
