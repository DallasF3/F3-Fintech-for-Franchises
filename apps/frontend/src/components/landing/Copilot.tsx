"use client";

import { motion } from "framer-motion";
import { Check, Zap, MessageSquare } from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const PROMPTS = [
  "Why are sales down at Store #12?",
  "Which locations are most at risk?",
  "Forecast revenue for next month",
  "Suggest a campaign for dormant customers",
];

const ANSWER =
  "Store #12 is down 14% week-over-week, driven mainly by a drop in repeat visits. Footfall held steady, but average ticket fell $3.20. I'd recommend a VIP win-back campaign — 86 lapsed regulars match the trigger.";

const CHECKS = [
  "Streaming real-time responses",
  "Grounded in live network data",
  "Powered by Claude with smart fallback",
];

const bubble = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: EASE },
  }),
};

export function Copilot() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-24 sm:py-32">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-[#ff385c]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[480px] w-[480px] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        {/* Left column */}
        <Reveal>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full">
            <Zap size={12} />
            AI Copilot
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[44px]">
            Ask your business{" "}
            <span className="text-[#ff385c]">anything</span>
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-[1.6] text-white/65">
            A streaming chat copilot that understands your entire network. Ask
            in plain English and get answers grounded in your real data — no
            dashboards to dig through.
          </p>
          <ul className="mt-8 space-y-3">
            {CHECKS.map((p, i) => (
              <motion.li
                key={p}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff385c] text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-[15px] text-white/80">{p}</span>
              </motion.li>
            ))}
          </ul>
        </Reveal>

        {/* Right column — chat window */}
        <Reveal delay={0.15}>
          <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6">
            {/* Header bar */}
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff385c]">
                <MessageSquare size={15} className="text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="block text-[14px] font-semibold text-white leading-none">
                  F3 Copilot
                </span>
                <span className="block text-[11px] text-white/40 mt-0.5">
                  Powered by Claude
                </span>
              </div>
              {/* Live dot */}
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live
              </span>
            </div>

            {/* Messages */}
            <div className="mt-5 space-y-3">
              {/* User message */}
              <motion.div
                custom={0}
                variants={bubble}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-[#ff385c] px-4 py-2.5 text-[14px] leading-snug text-white"
              >
                Why are sales down at Store #12?
              </motion.div>

              {/* AI response */}
              <motion.div
                custom={1}
                variants={bubble}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-white/8 px-4 py-3 text-[14px] leading-relaxed text-white/90"
              >
                <span className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-white/40 uppercase tracking-[0.1em]">
                  <Zap size={10} />
                  F3 Copilot
                </span>
                {ANSWER}
              </motion.div>

              {/* Typing indicator */}
              <motion.div
                custom={2}
                variants={bubble}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="w-fit rounded-2xl rounded-bl-md bg-white/8 px-4 py-3"
              >
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block h-1.5 w-1.5 rounded-full bg-white/40"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Prompt pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {PROMPTS.map((p, i) => (
                <motion.span
                  key={p}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-white/55 cursor-pointer hover:border-white/30 hover:text-white/80 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: EASE }}
                >
                  {p}
                </motion.span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
