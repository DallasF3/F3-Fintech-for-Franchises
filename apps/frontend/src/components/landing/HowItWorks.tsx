"use client";

import { motion } from "framer-motion";
import { Plug, ShieldCheck, Cpu, Target } from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    icon: Plug,
    step: "01",
    title: "Connect your systems",
    body: "Link Clover, iAccess, and Purple WiFi in minutes via API or webhook. Read-only access — always.",
    tags: ["Clover POS", "iAccess", "Purple WiFi"],
    iconBg: "bg-indigo-50 text-indigo-600",
    tagBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    accent: "bg-indigo-500",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "We normalize your data",
    body: "Every source maps to one canonical model. No raw card numbers stored — only tokenized references and the metrics that matter.",
    tags: ["Tokenized IDs", "PCI Safe", "Canonical Model"],
    iconBg: "bg-emerald-50 text-emerald-600",
    tagBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
    accent: "bg-emerald-500",
  },
  {
    icon: Cpu,
    step: "03",
    title: "AI gets to work",
    body: "Health scores, forecasts, anomaly alerts, and customer segments generated automatically and refreshed every day.",
    tags: ["FHS™ Scoring", "Forecasts", "Alerts"],
    iconBg: "bg-[#ff385c]/10 text-[#ff385c]",
    tagBg: "bg-[#ff385c]/8 text-[#ff385c] border-[#ff385c]/20",
    accent: "bg-[#ff385c]",
  },
  {
    icon: Target,
    step: "04",
    title: "Act with confidence",
    body: "Launch campaigns, intervene on at-risk stores, and pick expansion markets — all from plain-English briefings.",
    tags: ["Campaigns", "Briefings", "Expansion"],
    iconBg: "bg-amber-50 text-amber-600",
    tagBg: "bg-amber-50 text-amber-700 border-amber-100",
    accent: "bg-amber-500",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how"
      className="scroll-mt-20 bg-white border-y border-neutral-200/60 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full">
            How it works
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-neutral-900 sm:text-[44px]">
            Live in an afternoon,{" "}
            <span className="text-[#ff385c]">not a quarter</span>
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-neutral-500">
            From first connection to your first AI briefing in four steps.
          </p>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Connector line behind cards on large screens */}
          <div className="hidden lg:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-neutral-200 z-0" />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              className="z-10 relative rounded-[24px] border border-neutral-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow p-6 flex flex-col gap-3"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              {/* Step number + icon row */}
              <div className="flex items-start justify-between">
                <span className="text-[40px] font-black leading-none text-neutral-100 select-none">
                  {s.step}
                </span>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}
                >
                  <s.icon size={20} />
                </div>
              </div>

              <h3 className="text-[17px] font-bold tracking-tight text-neutral-900 leading-snug">
                {s.title}
              </h3>
              <p className="text-[14px] leading-[1.6] text-neutral-500 flex-1">
                {s.body}
              </p>

              {/* Tag pills */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${s.tagBg}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Animated accent bar */}
              <motion.div
                className={`h-0.5 rounded-full ${s.accent} mt-2`}
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: EASE }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
