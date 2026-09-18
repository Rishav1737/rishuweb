import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID;
const CAL_API_VERSION = "2024-08-13";

// Same Resend setup as /api/collab — add RESEND_API_KEY to .env.local.
// Your sending domain must be verified in the Resend dashboard.
const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: NextRequest) {
  if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
    return NextResponse.json(
      { error: "Cal.com is not configured (missing CAL_API_KEY or CAL_EVENT_TYPE_ID)." },
      { status: 500 },
    );
  }

  let body: {
    name?: string;
    email?: string;
    notes?: string;
    start?: string;
    timeZone?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, notes, start, timeZone } = body;

  if (!name?.trim() || !email?.trim() || !start) {
    return NextResponse.json(
      { error: "Name, email, and a selected time slot are required." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CAL_API_KEY}`,
        "cal-api-version": CAL_API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start,
        eventTypeId: Number(CAL_EVENT_TYPE_ID),
        attendee: {
          name,
          email,
          timeZone: timeZone || "UTC",
        },
        // Cal.com's "additional notes" booking field — this key can vary by
        // event type config. If notes don't show up in Cal, check your event
        // type's booking-question field name in the Cal.com dashboard and
        // adjust this key to match.
        bookingFieldsResponses: {
          notes: notes || "",
        },
      }),
    });

    const raw = await res.json();

    if (!res.ok) {
      console.error("[Cal.com] booking error", raw);
      const message =
        raw?.error?.message ||
        raw?.message ||
        "That slot may have just been taken. Please pick another time.";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const booking = raw?.data || raw;

    // Send a notification email — same pattern as /api/collab. This is
    // best-effort: if it fails, the booking itself has already succeeded
    // in Cal.com, so we log the error but still return success to the user.
    try {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safeNotes = escapeHtml(notes || "—");
      const startDisplay = booking?.start
        ? new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: timeZone || "UTC",
          }).format(new Date(booking.start))
        : "—";

      await resend.emails.send({
        // Same "from" note as /api/collab — needs a domain verified in Resend.
        from: "Rishab <onboarding@resend.dev>",
        to: ["workrishab6@gmail.com"],
        replyTo: email,
        subject: `New Call Booked — ${name}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Call Booked</title>
</head>
<body style="margin:0;padding:0;background:#080808;color:#f0f0ef;font-family:Georgia,'Times New Roman',serif;">
  <div style="max-width:600px;margin:0 auto;padding:48px 32px;">

    <p style="font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.3em;color:#e5e5e5;text-transform:uppercase;margin:0 0 16px;">✦ RISHAB × CALL BOOKING</p>

    <h1 style="font-size:48px;font-weight:normal;line-height:0.9;margin:0 0 28px;letter-spacing:-0.02em;">
      Call<br/><span style="color:#e5e5e5;">Booked.</span>
    </h1>

    <div style="height:1px;background:linear-gradient(to right,#e5e5e5,transparent);margin-bottom:40px;"></div>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.35);text-transform:uppercase;padding-bottom:6px;white-space:nowrap;padding-right:28px;vertical-align:top;width:80px;">FROM</td>
        <td style="font-size:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);">${safeName}</td>
      </tr>
      <tr><td colspan="2" style="height:20px;"></td></tr>
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.35);text-transform:uppercase;padding-bottom:6px;white-space:nowrap;padding-right:28px;vertical-align:top;">EMAIL</td>
        <td style="font-size:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);">
          <a href="mailto:${safeEmail}" style="color:#e5e5e5;text-decoration:none;">${safeEmail}</a>
        </td>
      </tr>
      <tr><td colspan="2" style="height:20px;"></td></tr>
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.35);text-transform:uppercase;padding-bottom:6px;white-space:nowrap;padding-right:28px;vertical-align:top;">WHEN</td>
        <td style="font-size:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,0.08);">${startDisplay}</td>
      </tr>
      <tr><td colspan="2" style="height:20px;"></td></tr>
      <tr>
        <td style="font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.35);text-transform:uppercase;padding-bottom:6px;white-space:nowrap;padding-right:28px;vertical-align:top;">NOTES</td>
        <td style="font-size:16px;line-height:1.75;color:rgba(255,255,255,0.7);white-space:pre-wrap;">${safeNotes}</td>
      </tr>
    </table>

    <div style="margin-top:48px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.07);">
      <p style="font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:rgba(255,255,255,0.2);text-transform:uppercase;margin:0;">YOUR-DOMAIN.COM</p>
    </div>
  </div>
</body>
</html>`,
      });
    } catch (emailError) {
      console.error("[Resend] call-booking notification failed", emailError);
    }

    return NextResponse.json({
      booking: {
        start: booking?.start,
        location: booking?.location,
      },
    });
  } catch (error) {
    console.error("[Cal.com] booking request failed", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
