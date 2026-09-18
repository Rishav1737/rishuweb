"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RED = "oklch(59.71% 0.23 23.86)";

const WORDS = [
  { text: "SCHEDULE", accent: false },
  { text: "A CALL.", accent: true },
] as const;

const SUCCESS_WORDS = [
  { text: "CALL", accent: false },
  { text: "CONFIRMED.", accent: true },
] as const;

const CORNERS = [
  { id: "tl", top: 24, left: 24 },
  { id: "tr", top: 24, right: 24 },
  { id: "bl", bottom: 24, left: 24 },
  { id: "br", bottom: 24, right: 24 },
] as const;

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SlotsByDate = Record<string, string[]>; // "YYYY-MM-DD" -> ISO start strings

interface BookingResult {
  start?: string;
  location?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CalBookingModal({ isOpen, onClose }: Props) {
  // ── form state ──
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  // ── calendar / slots state ──
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [slotsByDate, setSlotsByDate] = useState<SlotsByDate>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ── submit state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Escape key + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset everything after close animation finishes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setName("");
        setEmail("");
        setNotes("");
        setFieldError(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setSubmitError(null);
        setIsSuccess(false);
        setBookingResult(null);
        setIsSubmitting(false);
        const d = new Date();
        d.setDate(1);
        setMonthCursor(d);
      }, 900);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Fetch slots whenever the visible month changes (while open)
  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSlotsError(null);
    try {
      const rangeStart = new Date(monthCursor);
      if (rangeStart < today) rangeStart.setTime(today.getTime());
      const rangeEnd = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth() + 1,
        0
      );

      const params = new URLSearchParams({
        start: toDateKey(rangeStart),
        end: toDateKey(rangeEnd),
        timeZone,
      });
      const res = await fetch(`/api/cal/slots?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setSlotsError(data?.error || "Couldn't load availability.");
        setSlotsByDate({});
        return;
      }

      const grouped: SlotsByDate = {};
      for (const [date, entries] of Object.entries<{ start: string }[]>(
        data.slots || {}
      )) {
        grouped[date] = entries.map((e) => e.start);
      }
      setSlotsByDate(grouped);

      // Auto-select the first available date so the panel isn't empty
      const firstAvailable = Object.keys(grouped).sort()[0];
      setSelectedDate((prev) => (prev && grouped[prev] ? prev : firstAvailable ?? null));
      setSelectedSlot(null);
    } catch {
      setSlotsError("Couldn't load availability.");
      setSlotsByDate({});
    } finally {
      setLoadingSlots(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor, timeZone]);

  useEffect(() => {
    if (isOpen) fetchSlots();
  }, [isOpen, fetchSlots]);

  const goToMonth = (delta: number) => {
    setMonthCursor((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
      const floor = new Date(today.getFullYear(), today.getMonth(), 1);
      return next < floor ? floor : next;
    });
    setSelectedSlot(null);
  };

  // Build the calendar grid cells for the visible month
  const calendarCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; key: string } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: toDateKey(date) });
    }
    return cells;
  }, [monthCursor]);

  const timesForSelectedDate = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(new Date(iso));

  const formatDateHeading = (dateKey: string) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone,
    }).format(new Date(`${dateKey}T00:00:00`));

  const canGoPrevMonth =
    monthCursor.getFullYear() > today.getFullYear() ||
    monthCursor.getMonth() > today.getMonth();

  const onConfirm = async () => {
    if (!name.trim() || !email.trim()) {
      setFieldError("Name and email are required.");
      return;
    }
    if (!selectedSlot) {
      setFieldError("Pick a date and time first.");
      return;
    }
    setFieldError(null);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/cal/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          notes,
          start: selectedSlot,
          timeZone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error || "Something went wrong. Try another slot.");
        // A slot that was just taken — refresh availability
        fetchSlots();
        return;
      }
      setBookingResult({
        start: data?.booking?.start,
        location: data?.booking?.location,
      });
      setIsSuccess(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const borderBottom = (field: string) =>
    `1px solid ${focusedField === field ? RED : "rgba(255,255,255,0.13)"}`;

  const baseInput: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    borderTop: 0,
    borderLeft: 0,
    borderRight: 0,
    outline: "none",
    paddingBottom: "12px",
    paddingTop: "4px",
    fontFamily: "var(--font-poppins)",
    fontSize: "clamp(15px, 1.6vw, 17px)",
    color: "white",
    caretColor: RED,
    transition: "border-color 0.3s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-poppins)",
    fontSize: "9px",
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.28)",
    marginBottom: "10px",
  };

  return (
    <>
      <style>{`
        .cal-modal-input::placeholder {
          color: rgba(255,255,255,0.16);
          font-size: 13px;
          letter-spacing: 0.04em;
        }
        .cal-modal-scroll::-webkit-scrollbar { width: 4px; }
        .cal-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
        .cal-modal-scroll { scrollbar-width: thin; }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ duration: 0.88, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-200"
            style={{ background: "#080808" }}
            aria-modal="true"
            role="dialog"
            aria-label="Schedule a call"
          >
            {/* Grain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "200px",
              }}
            />

            {/* Corner brackets */}
            {CORNERS.map((c, i) => (
              <motion.div
                key={c.id}
                aria-hidden="true"
                className="absolute w-9 h-9 z-10 pointer-events-none"
                style={{
                  ...("top" in c ? { top: (c as { top: number }).top } : {}),
                  ...("bottom" in c ? { bottom: (c as { bottom: number }).bottom } : {}),
                  ...("left" in c ? { left: (c as { left: number }).left } : {}),
                  ...("right" in c ? { right: (c as { right: number }).right } : {}),
                  borderTop: c.id.includes("t") ? `1px solid ${RED}73` : "none",
                  borderBottom: c.id.includes("b") ? `1px solid ${RED}73` : "none",
                  borderLeft: c.id.includes("l") ? `1px solid ${RED}73` : "none",
                  borderRight: c.id.includes("r") ? `1px solid ${RED}73` : "none",
                }}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}

            {/* Scrollable wrapper */}
            <div className="relative z-10 h-full overflow-y-auto flex flex-col">
              {/* ── HEADER ── */}
              <header className="flex items-center justify-between px-6 md:px-16 pt-8 pb-5 shrink-0">
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    color: RED,
                    fontSize: "10px",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                  }}
                >
                  ✦ CALL BOOKING
                </span>

                <button
                  onClick={onClose}
                  className="flex items-center gap-3 cursor-pointer group"
                  style={{ background: "none", border: "none", padding: 0 }}
                  aria-label="Close booking dialog"
                >
                  <span
                    className="transition-colors group-hover:text-white/60"
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontSize: "10px",
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.25)",
                    }}
                  >
                    CLOSE
                  </span>
                  <span
                    className="transition-transform group-hover:rotate-90 group-hover:text-[color:var(--red)]"
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: "18px",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </span>
                </button>
              </header>

              <div
                className="mx-6 md:mx-16 shrink-0"
                style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
                aria-hidden="true"
              />

              {/* ── BODY ── */}
              <div className="flex-1 flex flex-col lg:flex-row px-6 md:px-16 py-10 gap-10 lg:gap-0 min-h-0">
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="booking-flow"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col lg:flex-row w-full gap-10 lg:gap-0"
                    >
                      {/* ── LEFT — Typography + form ── */}
                      <div className="lg:w-[38%] flex flex-col justify-center lg:py-6 lg:pr-14 shrink-0">
                        <p
                          style={{
                            fontFamily: "var(--font-poppins)",
                            color: RED,
                            fontSize: "9px",
                            letterSpacing: "0.28em",
                            textTransform: "uppercase",
                            marginBottom: "24px",
                          }}
                        >
                          ✦ BOOK TIME
                        </p>

                        <div aria-hidden="true">
                          {WORDS.map(({ text, accent }) => (
                            <div
                              key={text}
                              style={{
                                fontFamily: "var(--font-poppins)",
                                fontSize: "clamp(40px, 6vw, 76px)",
                                lineHeight: 0.9,
                                color: accent ? RED : "white",
                                fontWeight: "normal",
                                paddingBottom: "2px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {text}
                            </div>
                          ))}
                        </div>

                        <p
                          style={{
                            fontFamily: "var(--font-poppins)",
                            fontSize: "11px",
                            lineHeight: "1.8",
                            color: "rgba(255,255,255,0.28)",
                            marginTop: "22px",
                            marginBottom: "34px",
                            maxWidth: "320px",
                          }}
                        >
                          Free 30-minute intro call. Fill this in, pick a slot
                          on the right, and it&apos;s locked in.
                        </p>

                        {/* ── FORM ── */}
                        <div className="flex flex-col gap-6 max-w-sm">
                          <div>
                            <label style={labelStyle} htmlFor="cal-name">
                              Full name *
                            </label>
                            <input
                              id="cal-name"
                              className="cal-modal-input"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              onFocus={() => setFocusedField("name")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="Your name"
                              style={{ ...baseInput, borderBottom: borderBottom("name") }}
                            />
                          </div>

                          <div>
                            <label style={labelStyle} htmlFor="cal-email">
                              Email address *
                            </label>
                            <input
                              id="cal-email"
                              type="email"
                              className="cal-modal-input"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setFocusedField("email")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="your@email.com"
                              style={{ ...baseInput, borderBottom: borderBottom("email") }}
                            />
                          </div>

                          <div>
                            <label style={labelStyle} htmlFor="cal-notes">
                              What do you want to talk through?
                            </label>
                            <textarea
                              id="cal-notes"
                              className="cal-modal-input"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              onFocus={() => setFocusedField("notes")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="Project scope, timeline, budget…"
                              rows={3}
                              style={{
                                ...baseInput,
                                resize: "none",
                                borderBottom: borderBottom("notes"),
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Vertical divider — desktop */}
                      <div
                        aria-hidden="true"
                        className="hidden lg:block w-px self-stretch shrink-0"
                        style={{ background: "rgba(255,255,255,0.07)" }}
                      />

                      {/* ── RIGHT — Custom calendar + time slots ── */}
                      <div className="lg:w-[62%] flex flex-col lg:py-6 lg:pl-14 min-h-0">
                        <div
                          className="relative flex flex-col sm:flex-row overflow-hidden"
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className="absolute top-3 left-3 w-4 h-4 pointer-events-none z-10"
                            style={{ borderTop: `1px solid ${RED}`, borderLeft: `1px solid ${RED}` }}
                          />
                          <span
                            aria-hidden="true"
                            className="absolute bottom-3 right-3 w-4 h-4 pointer-events-none z-10"
                            style={{ borderBottom: `1px solid ${RED}`, borderRight: `1px solid ${RED}` }}
                          />

                          {/* Calendar grid */}
                          <div className="flex-1 p-5 md:p-7">
                            <div className="flex items-center justify-between mb-5">
                              <span
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "15px",
                                  color: "white",
                                }}
                              >
                                {MONTH_LABELS[monthCursor.getMonth()]}{" "}
                                <span style={{ color: "rgba(255,255,255,0.4)" }}>
                                  {monthCursor.getFullYear()}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => goToMonth(-1)}
                                  disabled={!canGoPrevMonth}
                                  aria-label="Previous month"
                                  style={{
                                    color: canGoPrevMonth ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)",
                                    background: "none",
                                    border: "none",
                                    cursor: canGoPrevMonth ? "pointer" : "default",
                                    fontSize: "16px",
                                    padding: "4px",
                                  }}
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  onClick={() => goToMonth(1)}
                                  aria-label="Next month"
                                  style={{
                                    color: "rgba(255,255,255,0.6)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    padding: "4px",
                                  }}
                                >
                                  ›
                                </button>
                              </div>
                            </div>

                            <div
                              className="grid grid-cols-7 gap-y-2 mb-2"
                              style={{
                                fontFamily: "var(--font-poppins)",
                                fontSize: "9px",
                                letterSpacing: "0.15em",
                                color: "rgba(255,255,255,0.3)",
                              }}
                            >
                              {DAY_LABELS.map((d) => (
                                <div key={d} className="text-center">
                                  {d}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-2">
                              {calendarCells.map((cell, i) => {
                                if (!cell) return <div key={`empty-${i}`} />;
                                const isPast = cell.date < today;
                                const hasSlots = (slotsByDate[cell.key]?.length ?? 0) > 0;
                                const isSelected = selectedDate === cell.key;
                                const clickable = hasSlots && !isPast;
                                return (
                                  <div key={`${cell.key}-${isSelected}`} className="flex items-center justify-center">
                                    <button
                                      type="button"
                                      disabled={!clickable}
                                      onClick={() => {
                                        setSelectedDate(cell.key);
                                        setSelectedSlot(null);
                                      }}
                                      style={{
                                        width: "30px",
                                        height: "30px",
                                        fontFamily: "var(--font-poppins)",
                                        fontSize: "12px",
                                        fontWeight: isSelected ? 600 : 400,
                                        color: isSelected
                                          ? "#080808"
                                          : clickable
                                          ? "white"
                                          : "rgba(255,255,255,0.15)",
                                        background: isSelected
                                          ? "white"
                                          : clickable
                                          ? `${RED}1f`
                                          : "transparent",
                                        border: "none",
                                        outline: "none",
                                        WebkitTapHighlightColor: "transparent",
                                        cursor: clickable ? "pointer" : "default",
                                        transition: "background 0.15s, color 0.15s",
                                      }}
                                      onMouseDown={(e) => e.preventDefault()}
                                    >
                                      {cell.date.getDate()}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {loadingSlots && (
                              <p
                                className="mt-4"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "10px",
                                  letterSpacing: "0.1em",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                Loading availability…
                              </p>
                            )}
                            {slotsError && (
                              <p
                                className="mt-4"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "10px",
                                  letterSpacing: "0.05em",
                                  color: RED,
                                }}
                              >
                                {slotsError}
                              </p>
                            )}
                            {!loadingSlots && !slotsError && Object.keys(slotsByDate).length === 0 && (
                              <p
                                className="mt-4"
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "10px",
                                  letterSpacing: "0.05em",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                No open times this month.
                              </p>
                            )}
                          </div>

                          {/* Time slots for selected date */}
                          <div
                            className="w-full sm:w-[190px] shrink-0 p-5 md:p-7 sm:border-l"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}
                          >
                            {selectedDate ? (
                              <>
                                <p
                                  style={{
                                    fontFamily: "var(--font-poppins)",
                                    fontSize: "12px",
                                    color: "white",
                                    marginBottom: "14px",
                                  }}
                                >
                                  {formatDateHeading(selectedDate)}
                                </p>
                                <div
                                  className="cal-modal-scroll flex flex-col gap-2 overflow-y-auto pr-1"
                                  style={{ maxHeight: "260px" }}
                                >
                                  {timesForSelectedDate.length === 0 && !loadingSlots && (
                                    <p
                                      style={{
                                        fontFamily: "var(--font-poppins)",
                                        fontSize: "10px",
                                        color: "rgba(255,255,255,0.3)",
                                      }}
                                    >
                                      No times this day.
                                    </p>
                                  )}
                                  {timesForSelectedDate.map((iso) => {
                                    const isSelected = selectedSlot === iso;
                                    return (
                                      <button
                                        key={iso}
                                        type="button"
                                        onClick={() => setSelectedSlot(iso)}
                                        className="flex items-center gap-2"
                                        style={{
                                          fontFamily: "var(--font-poppins)",
                                          fontSize: "12px",
                                          color: isSelected ? "#080808" : "white",
                                          background: isSelected ? RED : "transparent",
                                          border: `1px solid ${isSelected ? RED : "rgba(255,255,255,0.13)"}`,
                                          padding: "10px 12px",
                                          cursor: "pointer",
                                          transition: "all 0.15s",
                                        }}
                                      >
                                        <span
                                          aria-hidden="true"
                                          style={{
                                            width: "5px",
                                            height: "5px",
                                            borderRadius: "50%",
                                            background: isSelected ? "#080808" : RED,
                                            display: "inline-block",
                                            flexShrink: 0,
                                          }}
                                        />
                                        {formatTime(iso)}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <p
                                style={{
                                  fontFamily: "var(--font-poppins)",
                                  fontSize: "10px",
                                  color: "rgba(255,255,255,0.3)",
                                }}
                              >
                                Pick a date
                              </p>
                            )}
                          </div>
                        </div>

                        <p
                          style={{
                            fontFamily: "var(--font-poppins)",
                            fontSize: "9px",
                            letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.25)",
                            marginTop: "10px",
                          }}
                        >
                          Times shown in {timeZone}
                        </p>

                        {(fieldError || submitError) && (
                          <p
                            style={{
                              fontFamily: "var(--font-poppins)",
                              fontSize: "11px",
                              color: RED,
                              marginTop: "14px",
                            }}
                          >
                            {fieldError || submitError}
                          </p>
                        )}

                        <motion.button
                          type="button"
                          onClick={onConfirm}
                          disabled={isSubmitting}
                          className="relative overflow-hidden mt-6 w-full"
                          style={{
                            border: `1px solid ${RED}`,
                            padding: "18px 20px",
                            background: "transparent",
                            cursor: isSubmitting ? "wait" : "pointer",
                          }}
                          initial="rest"
                          whileHover={!isSubmitting ? "hov" : undefined}
                        >
                          <motion.div
                            aria-hidden="true"
                            variants={{
                              rest: { scaleX: 0 },
                              hov: { scaleX: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
                            }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: RED,
                              transformOrigin: "left",
                            }}
                          />
                          <span
                            className="relative z-10 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.28em] text-white"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            {isSubmitting ? "Booking…" : "Confirm booking →"}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    /* ── SUCCESS STATE ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col justify-center w-full max-w-xl mx-auto"
                    >
                      {SUCCESS_WORDS.map(({ text, accent }) => (
                        <div
                          key={text}
                          style={{
                            fontFamily: "var(--font-poppins)",
                            fontSize: "clamp(42px, 5.5vw, 76px)",
                            lineHeight: 0.88,
                            color: accent ? RED : "white",
                            fontWeight: "normal",
                            marginBottom: "2px",
                          }}
                        >
                          {text}
                        </div>
                      ))}

                      <div
                        style={{
                          height: "1px",
                          background: `linear-gradient(to right, ${RED}, transparent)`,
                          marginTop: "28px",
                          marginBottom: "24px",
                        }}
                      />

                      <p
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontSize: "14px",
                          lineHeight: "1.85",
                          color: "rgba(255,255,255,0.55)",
                          marginBottom: "8px",
                        }}
                      >
                        {bookingResult?.start
                          ? new Intl.DateTimeFormat("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              timeZone,
                            }).format(new Date(bookingResult.start))
                          : "You're on the calendar."}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontSize: "12px",
                          lineHeight: "1.85",
                          color: "rgba(255,255,255,0.32)",
                          marginBottom: "32px",
                        }}
                      >
                        A confirmation with the call details has been sent to{" "}
                        {email}.
                      </p>

                      <button
                        onClick={onClose}
                        style={{
                          fontFamily: "var(--font-poppins)",
                          fontSize: "10px",
                          letterSpacing: "0.3em",
                          textTransform: "uppercase",
                          color: RED,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textAlign: "left",
                          width: "fit-content",
                        }}
                      >
                        ← RETURN TO SITE
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
