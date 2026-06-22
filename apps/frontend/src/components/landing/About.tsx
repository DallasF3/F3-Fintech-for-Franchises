"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Activity,
  RefreshCw,
  Users,
} from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const CARD_CLS =
  "rounded-[24px] border border-neutral-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.09)] transition-shadow p-6 flex flex-col gap-4";

export function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-white border-t border-neutral-200/60 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-3 py-1 rounded-full">
            Our Platform
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-neutral-900 sm:text-[45px]">
            Engineered for Franchise Operations
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-neutral-500 sm:text-[18px]">
            F3 combines complex overnight data calculations into instant,
            actionable summaries.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Card 1 — Mission (col-span-2 on lg) */}
          <motion.div
            className={`${CARD_CLS} lg:col-span-2`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff385c] bg-[#ff385c]/10 px-2.5 py-0.5 rounded-full w-fit">
              Mission
            </span>
            <h3 className="text-[20px] font-bold tracking-tight text-neutral-900">
              The Intelligence Layer for Franchise Growth
            </h3>
            <p className="text-[14px] leading-[1.7] text-neutral-500 flex-1">
              Franchise networks generate enormous data across POS, payments,
              loyalty, and footfall, yet most of it never turns into a decision.
              F3 is the secure intelligence layer that changes that — a single
              platform that understands every location, giving franchisors
              immediate guidance on where to intervene and where to expand.
            </p>
            {/* Animated gradient bar */}
            <motion.div
              className="h-0.5 rounded-full bg-gradient-to-r from-[#ff385c] to-indigo-500"
              initial={{ width: 0 }}
              whileInView={{ width: "40%" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            />
          </motion.div>

          {/* Card 2 — Security (dark) */}
          <motion.div
            className="rounded-[24px] border border-neutral-800 bg-neutral-950 p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-[17px] font-bold tracking-tight text-white">
              Row-Level Tenant Isolation
            </h3>
            <p className="text-[13px] leading-[1.65] text-white/55 flex-1">
              Security built into the database. PostgreSQL RLS policies on all
              tables. No cross-tenant leaks, read-only integrations, tokenized
              card IDs.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "RLS Enforced", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                { label: "PCI Safe",     cls: "bg-blue-500/10 text-blue-400 border-blue-500/20"         },
                { label: "Read-Only",    cls: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"   },
              ].map((b) => (
                <span
                  key={b.label}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${b.cls}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 3 — Revenue Chart */}
          <motion.div
            className={CARD_CLS}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Cash Flow Analysis
              </h4>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-neutral-900">
                30/60/90-Day Cash Forecasts
              </h3>
              <p className="text-[12px] text-neutral-400 mt-1">
                95% confidence intervals based on historical POS signals.
              </p>
            </div>
            <div className="w-full bg-neutral-50 rounded-xl p-4 border border-neutral-100 mt-1">
              <svg
                className="w-full h-36"
                viewBox="0 0 300 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01" />
                  </linearGradient>
                  <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff385c" />
                    <stop offset="60%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <line x1="30" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="55" x2="280" y2="55" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="90" x2="280" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="30" y1="125" x2="280" y2="125" stroke="#e2e8f0" strokeWidth="1.5" />
                <motion.path
                  d="M120,95 L180,60 L240,40 L280,30 L280,75 L240,90 L180,110 L120,115 Z"
                  fill="url(#area-gradient)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
                <motion.path
                  d="M120,95 Q180,60 240,40 T280,30"
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
                <motion.path
                  d="M120,115 Q180,110 240,90 T280,75"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
                <motion.path
                  d="M30,120 Q70,115 120,105 T200,75 T280,52"
                  stroke="url(#line-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
                <circle cx="120" cy="105" r="4.5" fill="#ffffff" stroke="#ff385c" strokeWidth="2.5" />
                <line x1="120" y1="10" x2="120" y2="125" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                <text x="25" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">JUN</text>
                <text x="110" y="137" fill="#ff385c" fontSize="8" fontWeight="700">NOW</text>
                <text x="190" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">AUG</text>
                <text x="265" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">OCT</text>
              </svg>
            </div>
          </motion.div>

          {/* Card 4 — FHS Breakdown */}
          <motion.div
            className={CARD_CLS}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Franchise Health Score
              </h4>
              <Activity size={16} className="text-[#ff385c]" />
            </div>
            <h3 className="text-[17px] font-bold tracking-tight text-neutral-900">
              Franchise Health Score™
            </h3>

            {/* Circular ring */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    strokeWidth="3.2"
                    stroke="currentColor"
                    className="text-neutral-100"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    strokeDasharray="100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="#ff385c"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDashoffset: 100 }}
                    whileInView={{ strokeDashoffset: 6 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-extrabold text-neutral-900 leading-none">9.4</span>
                  <span className="text-[8px] font-bold uppercase text-neutral-400 mt-0.5">FHS™</span>
                </div>
              </div>
              <div>
                <p className="text-[13px] font-bold text-neutral-800">Outstanding Health</p>
                <p className="text-[12px] text-neutral-400 mt-1 leading-snug">
                  9 factors across transaction velocity, ticket sizes, and churn.
                </p>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-neutral-500 mb-1">
                  <span>Operational Hygiene</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neutral-800 rounded-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "92%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-neutral-500 mb-1">
                  <span>Customer Loyalty Retention</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#ff385c] rounded-full"
                    initial={{ width: "0%" }}
                    whileInView={{ width: "88%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5 — Sync Engine */}
          <motion.div
            className={CARD_CLS}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Modular Integrations
              </h4>
              <RefreshCw
                size={16}
                className="text-neutral-400 animate-spin"
                style={{ animationDuration: "12s" }}
              />
            </div>
            <h3 className="text-[17px] font-bold tracking-tight text-neutral-900">
              Live Queue Sync Engine
            </h3>
            <p className="text-[13px] leading-[1.65] text-neutral-500">
              Ingests Clover POS, Purple WiFi footfall, and iAccess merchant
              settlement webhooks in real-time.
            </p>
            <div className="w-full bg-neutral-50 rounded-xl p-4 border border-neutral-100 flex justify-center">
              <svg
                className="w-full max-w-[280px] h-24"
                viewBox="0 0 280 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M60,20 L135,45 M60,45 L135,45 M60,70 L135,45" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
                <path d="M195,45 L235,45" stroke="#818cf8" strokeWidth="2" />
                <rect x="5" y="10" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="12" y="22" fill="#64748b" fontSize="8" fontWeight="600">Clover POS</text>
                <rect x="5" y="36" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="10" y="48" fill="#64748b" fontSize="8" fontWeight="600">iAccess Pay</text>
                <rect x="5" y="62" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="12" y="74" fill="#64748b" fontSize="8" fontWeight="600">Purple WiFi</text>
                <rect x="135" y="28" width="60" height="34" rx="6" fill="#1e1b4b" />
                <text x="144" y="44" fill="#818cf8" fontSize="8" fontWeight="700">BULLMQ</text>
                <text x="142" y="53" fill="#ffffff" fontSize="7" fontWeight="500">Sync Queue</text>
                <circle cx="255" cy="45" r="18" fill="#ff385c" />
                <svg x="247" y="37" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                </svg>
              </svg>
            </div>
          </motion.div>

          {/* Card 6 — Customer Segments (col-span-2 on lg) */}
          <motion.div
            className={`${CARD_CLS} lg:col-span-2`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Customer Lifecycle
              </h4>
              <Users size={16} className="text-neutral-400" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold tracking-tight text-neutral-900">
                RFM Customer Segmentation
              </h3>
              <p className="text-[13px] text-neutral-400 mt-1">
                Categorize customers automatically by Recency, Frequency, and Monetary value.
              </p>
            </div>

            {/* Animated segmented bar */}
            <div className="h-6 w-full flex rounded-lg overflow-hidden border border-neutral-100 mt-1">
              <motion.div
                className="h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white"
                initial={{ width: "0%" }}
                whileInView={{ width: "45%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                45%
              </motion.div>
              <motion.div
                className="h-full bg-[#ff385c] flex items-center justify-center text-[10px] font-bold text-white border-l border-white"
                initial={{ width: "0%" }}
                whileInView={{ width: "25%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              >
                25%
              </motion.div>
              <motion.div
                className="h-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white border-l border-white"
                initial={{ width: "0%" }}
                whileInView={{ width: "18%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                18%
              </motion.div>
              <motion.div
                className="h-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 border-l border-white"
                initial={{ width: "0%" }}
                whileInView={{ width: "12%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              >
                12%
              </motion.div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { dot: "bg-neutral-800", label: "Active Growth: 45%"    },
                { dot: "bg-[#ff385c]",   label: "Core Loyalists: 25%"   },
                { dot: "bg-indigo-500",  label: "At Churn Risk: 18%"    },
                { dot: "bg-neutral-200", label: "Inactive Leads: 12%"   },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-600">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dot}`} />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
