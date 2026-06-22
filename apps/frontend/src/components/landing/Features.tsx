"use client";

import { motion } from "framer-motion";
import {
  Gauge, Sparkles, TrendingUp, Shield,
  Megaphone, ChevronUp, ChevronDown, AlertTriangle,
} from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Animated progress bar (whileInView) ───────────────────────────────────
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, delay, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Circular gauge SVG ────────────────────────────────────────────────────
function Gauge87() {
  const r = 44;
  const circ = 2 * Math.PI * r; // 276.5
  const offset = circ * (1 - 87 / 100);
  return (
    <div className="relative w-[110px] h-[110px] flex items-center justify-center flex-shrink-0">
      <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffa2b6" />
            <stop offset="100%" stopColor="#ff385c" />
          </linearGradient>
        </defs>
        <circle cx="55" cy="55" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <motion.circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[28px] font-black text-neutral-900 leading-none">87</span>
        <span className="text-[10px] font-bold text-neutral-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Location score data ───────────────────────────────────────────────────
const LOCS = [
  { name: "Downtown Cafe",    score: 89, trend: "up"      },
  { name: "Seattle Central",  score: 78, trend: "up"      },
  { name: "Austin South",     score: 54, trend: "down"    },
  { name: "Vegas Strip",      score: 92, trend: "up"      },
  { name: "Portland Mall",    score: 71, trend: "neutral" },
];
const barColor  = (s: number) => s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-400" : "bg-red-500";
const textColor = (s: number) => s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-red-500";

// ─── Shared card animation ─────────────────────────────────────────────────
const card = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, delay, ease: EASE },
});

// ══════════════════════════════════════════════════════════════════════════
export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-neutral-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* ── Header ── */}
        <Reveal className="mx-auto max-w-3xl text-center mb-16">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff385c] bg-[#ff385c]/8 border border-[#ff385c]/20 px-3.5 py-1.5 rounded-full mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
            The Platform
          </span>
          <h2 className="text-[32px] sm:text-[46px] font-extrabold leading-[1.1] tracking-[-0.03em] text-neutral-900 mt-4">
            The Operating System for<br />
            <span className="text-[#ff385c]">Modern Franchises</span>
          </h2>
          <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.65] text-neutral-500 max-w-2xl mx-auto">
            F3 sits on top of your POS, payments, and loyalty systems — turning raw data into decisions that protect revenue and accelerate growth across every location.
          </p>
        </Reveal>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* ─ 1: Franchise Health Score (wide) ─────────────────────────── */}
          <motion.div
            {...card(0)}
            className="lg:col-span-2 bg-white rounded-[24px] border border-neutral-200/80 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow duration-300 flex flex-col gap-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff385c]/10 text-[#ff385c] mb-3">
                  <Gauge size={20} />
                </div>
                <h3 className="text-[20px] font-bold tracking-tight text-neutral-900">
                  Franchise Health Score™
                </h3>
                <p className="mt-1.5 text-[14px] leading-[1.6] text-neutral-500 max-w-md">
                  One 0–100 score per location, blending 9 weighted signals — revenue growth, foot traffic, refunds, loyalty retention, and chargebacks.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg flex-shrink-0 mt-1">
                Live Scoring
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="flex flex-col items-center gap-1.5">
                <Gauge87 />
                <span className="text-[11px] font-semibold text-neutral-400">Network Avg.</span>
              </div>

              <div className="flex-1 w-full flex flex-col gap-2.5">
                {LOCS.map((loc, i) => (
                  <motion.div
                    key={loc.name}
                    initial={{ opacity: 0, x: 14 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.09, duration: 0.45, ease: EASE }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-[12px] font-medium text-neutral-600 w-[132px] flex-shrink-0 truncate">
                      {loc.name}
                    </span>
                    <div className="flex-1">
                      <Bar pct={loc.score} color={barColor(loc.score)} delay={0.4 + i * 0.09} />
                    </div>
                    <span className={`text-[12px] font-bold w-7 text-right tabular-nums ${textColor(loc.score)}`}>
                      {loc.score}
                    </span>
                    {loc.trend === "up"      && <ChevronUp   size={13} className="text-emerald-500 flex-shrink-0" />}
                    {loc.trend === "down"    && <ChevronDown  size={13} className="text-red-500 flex-shrink-0" />}
                    {loc.trend === "neutral" && <span className="w-3 h-px bg-neutral-300 inline-block flex-shrink-0" />}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─ 2: AI Executive Briefings (dark) ──────────────────────────── */}
          <motion.div
            {...card(0.1)}
            className="bg-neutral-950 rounded-[24px] border border-neutral-800 p-7 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-shadow duration-300 flex flex-col gap-5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Sparkles size={18} />
                </div>
                <div className="flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Generated 7:00 AM
                  </span>
                </div>
              </div>
              <h3 className="text-[20px] font-bold text-white tracking-tight">AI Executive Briefings</h3>
              <p className="mt-1.5 text-[13px] leading-[1.6] text-neutral-400">
                Wake up to plain-language summaries of what happened overnight, why, and exactly where to act today.
              </p>
            </div>

            {/* Terminal mockup */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col gap-2.5 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                <span className="text-[9px] text-neutral-500 ml-2 font-mono">briefing-jun-22.ai</span>
              </div>
              {[
                { sym: "↑", clr: "text-emerald-400", text: "Austin South +24% — loyalty reactivation working." },
                { sym: "↓", clr: "text-red-400",     text: "Portland Mall below forecast. Act today." },
                { sym: "⚠", clr: "text-amber-400",   text: "Refund spike at Store #44. Review iAccess data." },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.18, duration: 0.4, ease: EASE }}
                  className="flex items-start gap-2"
                >
                  <span className={`text-[12px] font-bold flex-shrink-0 mt-0.5 ${line.clr}`}>{line.sym}</span>
                  <span className="text-[11px] font-mono text-neutral-300 leading-[1.55]">{line.text}</span>
                </motion.div>
              ))}
              {/* Blinking cursor */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, duration: 0.3 }}
                className="flex items-center gap-1 mt-0.5"
              >
                <span className="text-[11px] font-mono text-neutral-500">›</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block w-1.5 h-3.5 bg-[#ff385c] rounded-[1px]"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* ─ 3: Revenue Forecasting ─────────────────────────────────────── */}
          <motion.div
            {...card(0.05)}
            className="bg-white rounded-[24px] border border-neutral-200/80 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow duration-300 flex flex-col gap-5"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-[20px] font-bold tracking-tight text-neutral-900">Revenue Forecasting</h3>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-neutral-500">
                30, 60, and 90-day projections with conservative, expected, and aggressive models — confidence intervals included.
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                { label: "30 Days", amount: "$42K",  pct: 42, color: "bg-indigo-400" },
                { label: "60 Days", amount: "$68K",  pct: 65, color: "bg-indigo-500" },
                { label: "90 Days", amount: "$94K",  pct: 88, color: "bg-[#ff385c]"  },
              ].map((row, i) => (
                <div key={row.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-neutral-500">{row.label}</span>
                    <span className="text-[13px] font-bold text-neutral-900">{row.amount}</span>
                  </div>
                  <Bar pct={row.pct} color={row.color} delay={0.3 + i * 0.12} />
                </div>
              ))}
            </div>

            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-3 flex items-center justify-between mt-auto">
              <span className="text-[11px] font-semibold text-neutral-400">Model accuracy</span>
              <motion.span
                className="text-[13px] font-bold text-emerald-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                94.2%
              </motion.span>
            </div>
          </motion.div>

          {/* ─ 4: Risk Protection ─────────────────────────────────────────── */}
          <motion.div
            {...card(0.1)}
            className="bg-white rounded-[24px] border border-neutral-200/80 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow duration-300 flex flex-col gap-5"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 mb-3">
                <Shield size={20} />
              </div>
              <h3 className="text-[20px] font-bold tracking-tight text-neutral-900">Risk Protection</h3>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-neutral-500">
                Anomaly detection flags refund spikes and chargeback patterns per location — automatic risk scoring with instant alerts.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  loc: "Store #44 — Vegas Strip",
                  msg: "3 refunds in 15 min",
                  dot: "bg-red-500",
                  badge: "text-red-600 bg-red-50 border-red-100",
                  label: "Critical",
                },
                {
                  loc: "Store #12 — Austin South",
                  msg: "Chargeback rate ↑ 2.4%",
                  dot: "bg-amber-400",
                  badge: "text-amber-600 bg-amber-50 border-amber-100",
                  label: "Warning",
                },
              ].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.14, duration: 0.45, ease: EASE }}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${a.badge}`}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${a.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-neutral-800 truncate">{a.loc}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{a.msg}</p>
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider flex-shrink-0 ${a.badge.split(" ")[0]}`}>
                    {a.label}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Risk level bar */}
            <div className="mt-auto">
              <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-400 mb-1.5">
                <span>Network Risk Level</span>
                <span className="text-amber-500 font-bold">Moderate</span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200">
                <motion.div
                  className="h-full w-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                  initial={{ marginLeft: "0%" }}
                  whileInView={{ marginLeft: "48%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* ─ 5: Campaign Automation ─────────────────────────────────────── */}
          <motion.div
            {...card(0.15)}
            className="bg-white rounded-[24px] border border-neutral-200/80 p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow duration-300 flex flex-col gap-5"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff385c]/10 text-[#ff385c] mb-3">
                <Megaphone size={20} />
              </div>
              <h3 className="text-[20px] font-bold tracking-tight text-neutral-900">Campaign Automation</h3>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-neutral-500">
                Behavior-triggered email, SMS, and coupon campaigns — reactivation, VIP rewards, and birthday flows run automatically.
              </p>
            </div>

            {/* Trigger → Action → Result flow */}
            <div className="flex flex-col gap-1">
              {[
                { step: "Trigger", icon: "⚡", desc: "Customer inactive 14 days",  bg: "bg-amber-50  border-amber-200",   txt: "text-amber-600"  },
                { step: "Action",  icon: "📱", desc: "SMS + 20% coupon sent",       bg: "bg-blue-50   border-blue-200",    txt: "text-blue-600"   },
                { step: "Result",  icon: "✓",  desc: "Redeemed within 48 hrs",      bg: "bg-emerald-50 border-emerald-200", txt: "text-emerald-600" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.14, duration: 0.4, ease: EASE }}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${item.bg}`}
                  >
                    <span className="text-[18px] w-7 text-center flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className={`text-[9px] font-extrabold uppercase tracking-wider ${item.txt}`}>{item.step}</p>
                      <p className="text-[12px] font-semibold text-neutral-800 mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                  {i < 2 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.45 + i * 0.14, duration: 0.3 }}
                      style={{ transformOrigin: "top" }}
                      className="ml-[26px] w-px h-3 bg-neutral-200"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Conversion stat */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-100 p-3 flex items-center justify-between mt-auto">
              <span className="text-[11px] font-semibold text-neutral-400">Avg. reactivation rate</span>
              <motion.span
                className="text-[13px] font-bold text-[#ff385c]"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                38% redemption
              </motion.span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
