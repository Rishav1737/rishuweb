"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import PhraseAnimation from "@/components/common/phrase-reveal";
import CalBookingModal from "./cal-booking-modal";

const RED = "oklch(59.71% 0.23 23.86)";

const CalBooking = () => {
  const containerRef = useRef(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, {
    once: true,
    margin: "0px 0px -80px 0px",
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax Logic
  const yImage = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const yCalendar = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Opens our own branded modal (cal-booking-modal.tsx) instead of Cal.com's
  // default popup UI. The modal embeds Cal inline, so the booking is still
  // fully powered by Cal.com — only the surrounding chrome is custom.
  const openBookingModal = () => setIsBookingOpen(true);

  return (
    <div
      ref={containerRef}
      className="w-full h-full py-10 md:py-20 overflow-hidden px-4 md:px-8"
    >
      {/* 1. Heading with scroll-triggered reveal */}
      <div
        ref={headerRef}
        className="container relative z-10 mb-16 px-6 text-center mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={
            headerInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
          }
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-4 w-fit rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-medium text-primary uppercase tracking-widest"
        >
          Book time
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32, filter: "blur(10px)" }}
          animate={
            headerInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}
          }
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            <PhraseAnimation phrase="Let's  Make  Something " />
            <span className="block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              <PhraseAnimation
                phrase="Awesome  Together"
                className="text-primary"
              />
            </span>
          </h3>
        </motion.div>

        {/* Sweeping line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={headerInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0 }}
          className="mx-auto mt-6 h-px max-w-xs bg-linear-to-r from-primary/60 via-primary/20 to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        >
          Schedule a 30-minute call to discuss your project and process.
        </motion.div>
      </div>

      {/* 2. Responsive Container: Flex Column on Mobile, Block on Desktop */}
      <div className="relative flex flex-col items-center lg:block max-w-7xl mx-auto">
        {/* --- LAYER 1: The Image --- */}
        <motion.div
          style={{ y: yImage }}
          className="relative z-0 w-full max-w-[400px] lg:max-w-none lg:mx-auto"
        >
          <img
            src={"/ichigo2.png"}
            alt="Profile photo"
            className="block mx-auto object-cover w-full h-auto"
          />
        </motion.div>

        {/* --- LAYER 2: The Overlays --- */}
        {/* Attached to yImage so they stick to the image during parallax */}
        <motion.div
          style={{ y: yImage }}
          className="absolute -top-1 w-full h-32 md:h-60 bg-gradient-to-b from-background to-transparent pointer-events-none z-10"
        />
        <motion.div
          style={{ y: yImage }}
          className="absolute -bottom-1 w-full h-32 md:h-60 bg-gradient-to-t from-background to-transparent pointer-events-none z-10"
        />

        {/* --- LAYER 3: The Booking Card --- */}
        {/* 
           Mobile: Relative position, margin-top, centered width 
           Desktop (lg): Absolute position, right aligned, square card
        */}
        <motion.div
          style={{ y: yCalendar }}
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -6 }}
          className="
            relative z-20 mt-4 w-full max-w-sm mx-auto
            lg:absolute lg:top-6 lg:right-0 lg:mt-0 lg:w-[380px]
          "
        >
          <motion.div
            className="relative aspect-square w-full flex flex-col justify-between p-8 md:p-10 overflow-hidden"
            style={{
              background: "rgba(8,8,8,0.65)",
              backdropFilter: "blur(10px)",
              border: `1px solid ${RED}33`,
            }}
            animate={{
              boxShadow: [
                `0 0 25px ${RED}1a`,
                `0 0 55px ${RED}33`,
                `0 0 25px ${RED}1a`,
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* corner brackets */}
            <span
              aria-hidden="true"
              className="absolute top-4 left-4 w-5 h-5"
              style={{
                borderTop: `1px solid ${RED}`,
                borderLeft: `1px solid ${RED}`,
              }}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 w-5 h-5"
              style={{
                borderBottom: `1px solid ${RED}`,
                borderRight: `1px solid ${RED}`,
              }}
            />

            {/* soft red glow blob in the corner for depth */}
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${RED}26, transparent 70%)`,
              }}
            />

            <div className="relative z-10">
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-4"
                style={{ color: RED, fontFamily: "'DM Mono', monospace" }}
              >
                ✦ Available for calls
              </p>
              <h4 className="text-2xl md:text-3xl font-semibold text-white leading-snug">
                Book a 30-min call
              </h4>
              <p className="mt-3 text-sm text-white/45 leading-relaxed max-w-[26ch]">
                Free intro call to talk through your project and process.
              </p>
            </div>

            <motion.button
              type="button"
              onClick={openBookingModal}
              whileHover="hov"
              whileTap={{ scale: 0.97 }}
              initial="rest"
              className="relative z-10 overflow-hidden mt-8 w-full"
              style={{ border: `1px solid ${RED}`, padding: "18px 20px" }}
            >
              <motion.span
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
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                Schedule call →
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Custom-branded booking modal — reference UI style, real Cal.com booking inside */}
      <CalBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};

export default CalBooking;
