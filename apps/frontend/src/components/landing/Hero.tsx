"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowRight, TrendingUp, Bell, AlertTriangle,
  Home, BarChart2, Users, Settings, Activity, Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

// SVG line chart: smooth upward revenue trend (viewBox 0 0 260 72)
const LINE =
  "M 0,47 C 8,45 16,42 24,42 C 32,42 39,46 47,45 C 55,44 63,30 71,33 " +
  "C 79,36 87,38 95,37 C 103,36 110,25 118,27 C 126,29 134,31 142,30 " +
  "C 150,29 158,18 166,20 C 174,22 182,23 189,23 C 197,23 205,12 213,14 " +
  "C 221,16 229,18 236,17 C 244,16 252,5 260,4";
const FILL = `${LINE} L 260,72 L 0,72 Z`;

const SIDEBAR = [
  { Icon: Home, active: true },
  { Icon: BarChart2, active: false },
  { Icon: Users, active: false },
  { Icon: Activity, active: false },
  { Icon: Settings, active: false },
];

function Counter({
  to,
  prefix = "",
  suffix = "",
  delay = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = performance.now();
      const dur = 1500;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
        if (p < 1) requestAnimationFrame(tick);
        else setV(to);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [to, delay]);
  return (
    <>
      {prefix}
      {v.toLocaleString()}
      {suffix}
    </>
  );
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white h-[calc(100vh-76px)] min-h-[620px] flex items-center"
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 68% 50%, rgba(255,56,92,0.05) 0%, transparent 65%), " +
            "radial-gradient(ellipse 40% 50% at 15% 80%, rgba(99,102,241,0.03) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 flex items-center gap-8 xl:gap-14 h-full py-8">

        {/* ─── LEFT: Copy ─── */}
        <div className="flex-shrink-0 w-full lg:w-[42%] flex flex-col justify-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: EASE }}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#ff385c]/25 bg-[#ff385c]/8 px-3.5 py-1.5 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#ff385c]">
              AI-Powered Franchise Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="text-[40px] sm:text-[52px] lg:text-[44px] xl:text-[54px] font-extrabold leading-[1.08] tracking-[-0.03em] text-neutral-900"
          >
            Scale Your Entire
            <br />
            <span className="text-[#ff385c]">Franchise Network</span>
            <br />
            With AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.22, ease: EASE }}
            className="mt-5 text-[15px] sm:text-[16px] leading-[1.7] text-neutral-500 max-w-[400px]"
          >
            Turn transaction, payment, and customer data into intelligent business actions. Predict risk, automate marketing, and grow profitably.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href="/auth/signup"
              className="group flex h-12 items-center gap-2 rounded-full bg-[#ff385c] px-7 text-[14px] font-semibold text-white shadow-[0_8px_24px_-4px_rgba(255,56,92,0.55)] hover:bg-[#e00b41] hover:shadow-[0_10px_28px_-4px_rgba(255,56,92,0.7)] transition-all duration-300"
            >
              Get Started Free
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#features"
              className="flex h-12 items-center gap-2 rounded-full border border-neutral-200 bg-white px-7 text-[14px] font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-800 transition-all duration-300"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mt-10 flex items-center gap-6"
          >
            {[
              { value: "$1.84M", label: "Revenue tracked" },
              { value: "128", label: "Locations managed" },
              { value: "94%", label: "Retention rate" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-[19px] font-extrabold text-neutral-900 leading-none">{s.value}</span>
                <span className="text-[11px] text-neutral-400 mt-0.5">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── RIGHT: Dashboard Mockup ─── */}
        <div className="hidden lg:flex lg:w-[58%] h-full items-center relative">

          {/* Floating: AI Insight */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.1, ease: EASE }}
            className="absolute top-8 -left-8 z-30 flex items-center gap-2.5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-4 py-3 pointer-events-none"
          >
            <div className="h-8 w-8 rounded-xl bg-[#ff385c]/10 flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-[#ff385c]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-800">AI Insight Triggered</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Austin South +24% this week</p>
            </div>
          </motion.div>

          {/* Floating: Alert */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 2.5, ease: EASE }}
            className="absolute bottom-14 -left-8 z-30 flex items-center gap-2.5 rounded-2xl bg-white border border-neutral-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.1)] px-4 py-3 pointer-events-none"
          >
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={13} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-800">Refund Spike Detected</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Store #44 — requires review</p>
            </div>
          </motion.div>

          {/* Dashboard Window */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className="w-full rounded-2xl border border-neutral-200/70 bg-[#f9fafb] shadow-[0_30px_80px_-12px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 border-b border-neutral-200/80 bg-neutral-100/70 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <div className="mx-auto flex items-center gap-1.5 rounded-lg bg-white border border-neutral-200 px-3 py-1.5 text-[11px] text-neutral-400 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
                app.f3.ai/executive
              </div>
              <Bell size={13} className="text-neutral-400 ml-2 flex-shrink-0" />
            </div>

            {/* App Body */}
            <div className="flex">

              {/* Sidebar */}
              <div className="flex flex-col items-center gap-1.5 border-r border-neutral-200/60 bg-white py-4 px-2 w-[42px]">
                {SIDEBAR.map(({ Icon, active }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.06, duration: 0.35, ease: EASE }}
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-default ${
                      active
                        ? "bg-[#ff385c] shadow-[0_2px_8px_rgba(255,56,92,0.45)]"
                        : "text-neutral-400"
                    }`}
                  >
                    <Icon size={13} className={active ? "text-white" : "text-neutral-400"} />
                  </motion.div>
                ))}
              </div>

              {/* Main Panel */}
              <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold text-neutral-800">Executive Dashboard</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Network overview · 128 locations · Updated just now</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white border border-neutral-200 px-2.5 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Live</span>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-2.5">

                  {/* Health Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65, duration: 0.45, ease: EASE }}
                    className="rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Health Score</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-[24px] font-black text-neutral-900 leading-none tabular-nums">
                        <Counter to={87} delay={800} />
                      </span>
                      <span className="text-[11px] text-neutral-400">/100</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#ff385c] to-[#e00b41]"
                        initial={{ width: 0 }}
                        animate={{ width: "87%" }}
                        transition={{ duration: 1.3, delay: 0.9, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <TrendingUp size={9} className="text-emerald-500" />
                      <span className="text-[9px] font-semibold text-emerald-500">+4 pts this month</span>
                    </div>
                  </motion.div>

                  {/* Revenue Today */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75, duration: 0.45, ease: EASE }}
                    className="rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Revenue Today</p>
                    <div className="mt-1.5">
                      <span className="text-[19px] font-black text-neutral-900 leading-none tabular-nums">
                        <Counter prefix="$" to={28420} delay={900} />
                      </span>
                    </div>
                    {/* Sparkline */}
                    <div className="mt-2 flex items-end gap-0.5 h-7">
                      {[40, 55, 48, 64, 58, 72, 65, 82].map((h, i) => (
                        <motion.div
                          key={i}
                          className={`flex-1 rounded-[2px] ${i === 7 ? "bg-[#ff385c]" : "bg-[#ffd1da]"}`}
                          style={{ height: `${h}%`, transformOrigin: "bottom" }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 1.0 + i * 0.055, duration: 0.4, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <TrendingUp size={9} className="text-emerald-500" />
                      <span className="text-[9px] font-semibold text-emerald-500">+12.4% vs yesterday</span>
                    </div>
                  </motion.div>

                  {/* Active Stores */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.45, ease: EASE }}
                    className="rounded-xl border border-neutral-200/70 bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Active Stores</p>
                    <div className="mt-1.5">
                      <span className="text-[24px] font-black text-neutral-900 leading-none tabular-nums">
                        <Counter to={128} delay={1000} />
                      </span>
                    </div>
                    {/* Dot grid */}
                    <div className="mt-2 grid grid-cols-8 gap-0.5">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.1 + i * 0.022, duration: 0.25 }}
                          className={`h-2 w-2 rounded-full ${i < 21 ? "bg-[#ff385c]" : "bg-neutral-200"}`}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5">
                      <span className="text-[9px] font-semibold text-indigo-500">+3 new this quarter</span>
                    </div>
                  </motion.div>

                </div>

                {/* Annual Revenue Line Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95, duration: 0.45, ease: EASE }}
                  className="rounded-xl border border-neutral-200/70 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Annual Revenue</p>
                      <p className="text-[15px] font-black text-neutral-900 leading-tight mt-0.5">
                        $1.84M{" "}
                        <span className="text-[11px] font-semibold text-emerald-500">↑ 32%</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff385c]" />
                        Gross
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-[#ffd1da]" />
                        Loyalty
                      </div>
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 260 72"
                    className="w-full"
                    style={{ height: 72 }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff385c" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#ff385c" stopOpacity="0.01" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ffa2b6" />
                        <stop offset="100%" stopColor="#ff385c" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[18, 36, 54].map((y) => (
                      <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                    ))}

                    {/* Area fill — fades in after line draws */}
                    <motion.path
                      d={FILL}
                      fill="url(#chartFill)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 2.6 }}
                    />

                    {/* Animated line */}
                    <motion.path
                      d={LINE}
                      stroke="url(#lineGrad)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.8, delay: 1.3, ease: "easeInOut" }}
                    />

                    {/* Endpoint dot */}
                    <motion.circle
                      cx="260" cy="4" r="4"
                      fill="#ff385c"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.9, duration: 0.3 }}
                    />
                    {/* Pulse ring (opacity only — SVG scale is origin-relative) */}
                    <motion.circle
                      cx="260" cy="4" r="9"
                      fill="none"
                      stroke="#ff385c"
                      strokeWidth="1.5"
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ delay: 3.0, duration: 1.2, repeat: Infinity, repeatDelay: 1.8 }}
                    />
                  </svg>

                  <div className="flex justify-between text-[8px] font-semibold text-neutral-300 mt-1.5 uppercase tracking-wider">
                    {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </motion.div>

                {/* AI Briefing strip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.45, ease: EASE }}
                  className="flex items-start gap-3 rounded-xl border border-[#ff385c]/20 bg-gradient-to-r from-[#ff385c]/6 to-[#ff385c]/2 p-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#ff385c]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap size={12} className="text-[#ff385c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[9px] font-extrabold text-[#ff385c] uppercase tracking-widest">
                        AI Executive Briefing
                      </p>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff385c] animate-pulse" />
                        <span className="text-[8px] font-bold text-[#ff385c]">Live</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-600 leading-relaxed">
                      <span className="font-bold text-neutral-800">3 stores</span> trending below forecast. Downtown is top expansion candidate this quarter. Refund spike at Store #44.
                    </p>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
