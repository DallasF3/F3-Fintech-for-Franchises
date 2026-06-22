"use client";

import { motion } from "framer-motion";
import { Check, Building2, Store, TrendingUp, AlertTriangle } from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const FRANCHISOR_POINTS = [
  "Network-wide health scoring and benchmarks",
  "Rank and compare every location instantly",
  "Spot at-risk stores before revenue drops",
  "Launch campaigns across the entire network",
  "Data-backed expansion recommendations",
];

const FRANCHISEE_POINTS = [
  "Real-time revenue and transaction insight",
  "Know your customers and what brings them back",
  "Catch refund and chargeback issues early",
  "AI recommendations tailored to your store",
  "Anonymized benchmarks against top performers",
];

const LOCATIONS = [
  { name: "Downtown",  score: 89, color: "bg-emerald-500" },
  { name: "Seattle",   score: 54, color: "bg-amber-400"   },
  { name: "Austin",    score: 92, color: "bg-emerald-500" },
  { name: "Vegas",     score: 71, color: "bg-amber-400"   },
];

const SPARKLINE = [55, 62, 58, 70, 65, 74, 68, 82];

export function Benefits() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full">
            Built for Both Sides
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-neutral-900 sm:text-[44px]">
            Value the moment{" "}
            <span className="text-[#ff385c]">you log in</span>
          </h2>
          <p className="mt-4 text-[17px] leading-[1.6] text-neutral-500">
            One platform, two perspectives. Each user sees exactly what they need
            and nothing they shouldn&apos;t.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          {/* Franchisor Card — dark */}
          <Reveal delay={0}>
            <div className="h-full rounded-[24px] border border-neutral-800 bg-neutral-950 p-7 sm:p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Building2 size={20} />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff385c]">
                  For Franchisors
                </span>
              </div>
              <h3 className="text-[24px] font-bold leading-snug tracking-tight text-white">
                See your whole network at a glance
              </h3>

              {/* Mini widget: location score bars */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/40 mb-3">
                  Location Health
                </p>
                {LOCATIONS.map((loc, i) => (
                  <div key={loc.name} className="flex items-center gap-3">
                    <span className="w-16 text-[12px] font-medium text-white/60 shrink-0">
                      {loc.name}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${loc.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${loc.score}%` }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.9, delay: i * 0.1, ease: EASE }}
                      />
                    </div>
                    <span className="w-7 text-right text-[12px] font-bold text-white/70 shrink-0">
                      {loc.score}
                    </span>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <ul className="space-y-2.5 mt-auto">
                {FRANCHISOR_POINTS.map((p, i) => (
                  <motion.li
                    key={p}
                    className="flex items-start gap-2.5"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                  >
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#ff385c]/20 text-[#ff385c]">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-[14px] leading-[1.5] text-white/75">{p}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Franchisee Card — light */}
          <Reveal delay={0.1}>
            <div className="h-full rounded-[24px] border border-neutral-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow p-7 sm:p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                  <Store size={20} />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#ff385c]">
                  For Franchisees
                </span>
              </div>
              <h3 className="text-[24px] font-bold leading-snug tracking-tight text-neutral-900">
                Run a stronger single store
              </h3>

              {/* Mini widget: today's revenue + sparkline + alert */}
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                      Today&apos;s Revenue
                    </p>
                    <p className="text-[26px] font-black tracking-tight text-neutral-900 leading-none mt-1">
                      $9,450
                    </p>
                  </div>
                  <div className="flex items-end gap-1">
                    {SPARKLINE.map((h, i) => (
                      <motion.div
                        key={i}
                        className={`w-3 rounded-t-sm ${i === SPARKLINE.length - 1 ? "bg-[#ff385c]" : "bg-neutral-200"}`}
                        style={{ height: `${(h / 82) * 32}px` }}
                        initial={{ scaleY: 0, originY: 1 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                      />
                    ))}
                  </div>
                </div>
                {/* Amber alert */}
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  <span className="text-[12px] font-medium text-amber-700">
                    Avg ticket down $3.20 vs last week
                  </span>
                </div>
              </div>

              {/* Revenue trend icon */}
              <div className="flex items-center gap-2 -mt-2">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-[13px] font-medium text-emerald-600">+12% vs last month</span>
              </div>

              {/* Checklist */}
              <ul className="space-y-2.5 mt-auto">
                {FRANCHISEE_POINTS.map((p, i) => (
                  <motion.li
                    key={p}
                    className="flex items-start gap-2.5"
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                  >
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-[#ff385c]/10 text-[#ff385c]">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="text-[14px] leading-[1.5] text-neutral-600">{p}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
