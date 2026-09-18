import { NextRequest, NextResponse } from "next/server";

// Requires these in .env.local (see README):
//   CAL_API_KEY=cal_live_xxxxx     — Cal.com Settings → Developer → API Keys
//   CAL_EVENT_TYPE_ID=1234567      — the numeric id of your event type
//                                     (Event Types → open the event → check the URL)
const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID;
const CAL_API_VERSION = "2024-09-04";

type CalSlotEntry = { time?: string; start?: string };
type CalSlotsResponseGrouped = { data?: Record<string, CalSlotEntry[]> };
type CalSlotsResponseFlat = { data?: CalSlotEntry[] };

export async function GET(req: NextRequest) {
  if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
    return NextResponse.json(
      { error: "Cal.com is not configured (missing CAL_API_KEY or CAL_EVENT_TYPE_ID)." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start"); // "YYYY-MM-DD"
  const end = searchParams.get("end"); // "YYYY-MM-DD"
  const timeZone = searchParams.get("timeZone") || "UTC";

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end date." }, { status: 400 });
  }

  try {
    const url = new URL("https://api.cal.com/v2/slots");
    url.searchParams.set("eventTypeId", CAL_EVENT_TYPE_ID);
    url.searchParams.set("start", start);
    url.searchParams.set("end", end);
    url.searchParams.set("timeZone", timeZone);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "cal-api-version": CAL_API_VERSION,
      },
      // Availability changes constantly — never cache this.
      cache: "no-store",
    });

    const raw = await res.json();

    if (!res.ok) {
      console.error("[Cal.com] slots error", raw);
      return NextResponse.json(
        { error: raw?.error?.message || raw?.message || "Couldn't load availability." },
        { status: res.status },
      );
    }

    // Cal's v2 /slots response can come back either grouped by date
    // ({ data: { "2025-09-16": [{ time }] } }) or as a flat array
    // ({ data: [{ start }] }). Normalize both into { "YYYY-MM-DD": [{ start }] }.
    const slots: Record<string, { start: string }[]> = {};

    const data = raw?.data;
    if (Array.isArray(data)) {
      const flat = raw as CalSlotsResponseFlat;
      for (const entry of flat.data || []) {
        const iso = entry.start || entry.time;
        if (!iso) continue;
        const dateKey = iso.slice(0, 10);
        (slots[dateKey] ||= []).push({ start: iso });
      }
    } else if (data && typeof data === "object") {
      const grouped = raw as CalSlotsResponseGrouped;
      for (const [dateKey, entries] of Object.entries(grouped.data || {})) {
        slots[dateKey] = (entries || [])
          .map((e) => e.start || e.time)
          .filter((iso): iso is string => Boolean(iso))
          .map((iso) => ({ start: iso }));
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("[Cal.com] slots request failed", error);
    return NextResponse.json({ error: "Couldn't load availability." }, { status: 500 });
  }
}
