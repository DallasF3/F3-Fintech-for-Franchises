"use client";

import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const TRUST = [
  "128+ Locations managed",
  "$1.84M Revenue tracked",
  "94% Retention rate",
];

export function CTA() {
  return (
    <section
      id="cta"
      className="scroll-mt-20 bg-white py-24 px-5 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 px-6 py-20 text-center sm:px-12 sm:py-28">
          {/* Ambient glows */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#ff385c]/25 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-[100px]" />

          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[12px] font-semibold text-white/60 mb-6"
            >
              <Zap size={12} className="text-[#ff385c]" />
              Free to start · No credit card required
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="mx-auto max-w-3xl text-[36px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[54px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            >
              Turn your franchise data into{" "}
              <span className="text-[#ff385c]">growth</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="mx-auto mt-5 max-w-xl text-[17px] leading-[1.6] text-white/60"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
            >
              Connect your first system in minutes. Your first AI briefing
              arrives the same morning.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
            >
              <a
                href="/auth/signup"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff385c] px-8 text-[15px] font-semibold text-white transition-all hover:bg-[#e00b41] hover:shadow-[0_8px_28px_-6px_rgba(255,56,92,0.65)] sm:w-auto"
              >
                Start for free
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="#about"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 text-[15px] font-semibold text-white/70 transition-all hover:border-white/30 hover:text-white sm:w-auto"
              >
                Explore features
              </a>
            </motion.div>

            {/* Trust proof */}
            <motion.div
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            >
              {TRUST.map((item, i) => (
                <div key={item} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-4 hidden h-4 w-px bg-white/15 sm:block" />
                  )}
                  <span className="text-[13px] font-medium text-white/45">
                    {item}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
