"use client";

import { motion } from "framer-motion";
import { Activity, Clock, TrendingUp, Database } from "lucide-react";
import { Reveal, Counter } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS = [
  {
    value: 9,
    suffix: "",
    label: "Health factors scored per location",
    sub: "FHS™ across 128 locations",
    Icon: Activity,
    iconCls: "text-[#ff385c] bg-[#ff385c]/10",
    accentFrom: "from-[#ff385c]",
  },
  {
    value: 24,
    suffix: "/7",
    label: "Anomaly monitoring",
    sub: "Zero blind spots in your network",
    Icon: Clock,
    iconCls: "text-indigo-500 bg-indigo-50",
    accentFrom: "from-indigo-500",
  },
  {
    value: 90,
    suffix: "-day",
    label: "Revenue forecasting horizon",
    sub: "Conservative, expected & aggressive",
    Icon: TrendingUp,
    iconCls: "text-emerald-600 bg-emerald-50",
    accentFrom: "from-emerald-500",
  },
  {
    value: 5,
    suffix: "×",
    label: "Data sources unified",
    sub: "POS, payments, WiFi, CRM, loyalty",
    Icon: Database,
    iconCls: "text-amber-600 bg-amber-50",
    accentFrom: "from-amber-500",
  },
] as const;

export function Stats() {
  return (
    <section
      id="results"
      className="scroll-mt-20 bg-neutral-50 border-y border-neutral-200/60 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full">
            The Numbers
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-neutral-900 sm:text-[44px]">
            Intelligence that{" "}
            <span className="text-[#ff385c]">compounds</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-[24px] border border-neutral-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow p-6 flex flex-col gap-3"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconCls}`}
              >
                <s.Icon size={20} />
              </div>

              {/* Counter */}
              <p className="text-[48px] sm:text-[56px] font-black leading-none tracking-tight text-neutral-900">
                <Counter value={s.value} suffix={s.suffix} />
              </p>

              {/* Label + sub */}
              <div>
                <p className="text-[14px] font-semibold text-neutral-700 leading-snug">
                  {s.label}
                </p>
                <p className="mt-1 text-[12px] text-neutral-400">{s.sub}</p>
              </div>

              {/* Accent bar */}
              <motion.div
                className={`h-0.5 rounded-full bg-gradient-to-r ${s.accentFrom} to-transparent mt-1`}
                initial={{ width: 0 }}
                whileInView={{ width: "60%" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: i * 0.1 + 0.3, ease: EASE }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
