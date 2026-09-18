"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import CollabModal from "./collab-modal";

const RED = "oklch(59.71% 0.23 23.86)";

const TICKER_ITEMS = [
  "2D INTRO MUSIC VIDEO",
  "MOVIE & BRAND INTROS",
  "MOTION GRAPHICS",
  "WEBSITE",
];

const CORNERS = [
  { id: "tl", top: 24, left: 24 },
  { id: "tr", top: 24, right: 24 },
  { id: "bl", bottom: 24, left: 24 },
  { id: "br", bottom: 24, right: 24 },
] as const;

const FinalCta: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section
        className="relative w-full overflow-hidden"
        style={{ background: "#0a0a0a", minHeight: "520px" }}
      >
        {/* Corner brackets */}
        {CORNERS.map((c) => (
          <span
            key={c.id}
            aria-hidden="true"
            className="absolute w-9 h-9 z-20 pointer-events-none"
            style={{
              ...("top" in c ? { top: (c as { top: number }).top } : {}),
              ...("bottom" in c
                ? { bottom: (c as { bottom: number }).bottom }
                : {}),
              ...("left" in c ? { left: (c as { left: number }).left } : {}),
              ...("right" in c
                ? { right: (c as { right: number }).right }
                : {}),
              borderTop: c.id.includes("t")
                ? `1px solid ${RED}73`
                : "none",
              borderBottom: c.id.includes("b")
                ? `1px solid ${RED}73`
                : "none",
              borderLeft: c.id.includes("l") ? `1px solid ${RED}73` : "none",
              borderRight: c.id.includes("r")
                ? `1px solid ${RED}73`
                : "none",
            }}
          />
        ))}

        {/* Faint artwork, bottom-left, fading into the background */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-[40%] max-w-[380px] pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to top right, black 20%, transparent 75%)",
            WebkitMaskImage:
              "linear-gradient(to top right, black 20%, transparent 75%)",
            opacity: 0.85,
          }}
        >
          <img
            src="/bg/2.png"
            alt=""
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-16 pt-14 md:pt-20 pb-24">
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mb-10 md:mb-14"
          >
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: RED }}
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className="text-[11px] md:text-xs uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Available for projects
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-bold leading-[1.05]"
            style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)" }}
          >
            <span className="block text-white">Got a project?</span>
            <span className="block" style={{ color: RED }}>
              Let&apos;s build it.
            </span>
          </motion.h2>

          {/* Circular arrow button */}
          <motion.button
            type="button"
            onClick={() => setModalOpen(true)}
            initial={{ scale: 0.6 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-14 right-6 md:top-20 md:right-16 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "#ffffff", opacity: 1 }}
            aria-label="Start a project"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </motion.button>
        </div>

        {/* Ticker strip */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden py-5"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <motion.div
            className="flex items-center gap-10 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map(
              (item, i) => (
                <React.Fragment key={`${item}-${i}`}>
                  <span
                    className="text-xs md:text-sm uppercase tracking-[0.25em]"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {item}
                  </span>
                  <span style={{ color: RED, fontSize: "10px" }}>✦</span>
                </React.Fragment>
              ),
            )}
          </motion.div>
        </div>
      </section>

      <CollabModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default FinalCta;
