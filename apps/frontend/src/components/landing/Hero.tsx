"use client";

import { motion } from "framer-motion";
import { ArrowRight, Plus, MoreHorizontal } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white pt-[76px] pb-24 lg:pb-36 flex flex-col items-center scroll-mt-20">
      
      {/* 1. Color Palette & Background Atmosphere */}
      {/* Candy-pink background gradient layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fff2f4 45%, #ffd6df 100%)",
        }}
      />
      
      {/* Backdrop Grid: faint vertical grid lines in the lower half */}
      <div 
        className="absolute bottom-0 inset-x-0 h-3/5 pointer-events-none opacity-25"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255, 56, 92, 0.15) 1px, transparent 1px)",
          backgroundSize: "80px 100%",
        }}
      />

      {/* Glow Effects: Soft ambient pink/rose glow orbs */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 h-[350px] w-[800px] rounded-full bg-[#ff385c]/10 blur-[120px]" />
      
      <div className="relative w-full max-w-7xl px-6 pt-16 sm:px-10 sm:pt-20 text-center z-10">
        
        {/* 2. Typography & Text Hierarchy */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-[44px] font-extrabold leading-[1.12] tracking-[-0.03em] text-neutral-800 sm:text-[62px] max-w-4xl mx-auto font-sans"
        >
          Scale and Automate Your Entire Franchise Network with AI
        </motion.h1>

        {/* 3. Call-to-Action (CTA) Cluster */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          {/* Primary CTA (Hot-pink pill button with heavy matching shadow) */}
          <a
            href="/auth/signup"
            className="group flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#ff385c] px-8 text-sm font-semibold text-white shadow-[0_8px_24px_-4px_rgba(255,56,92,0.65)] hover:bg-[#e00b41] hover:shadow-[0_12px_28px_-4px_rgba(255,56,92,0.8)] transition-all duration-300"
          >
            Get Started Free
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* 4. Component Architecture (Glassmorphism Floating Cards) */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12 items-start text-left max-w-6xl mx-auto">
          
          {/* Left Card: "Location Sales" */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="lg:col-span-3 bg-white/60 backdrop-blur-md border border-white/80 p-5 rounded-[24px] shadow-[0_8px_32px_0_rgba(255,56,92,0.04)] flex flex-col gap-4"
          >
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
              Location Sales
            </span>
            
            {/* Sales items */}
            <div className="flex flex-col gap-3">
              {[
                { title: "Downtown Cafe", value: "$9,450 today", time: "Peak hour: 12PM - 1PM", code: "JD" },
                { title: "Seattle Central", value: "$12,120 today", time: "Peak hour: 1PM - 2PM", code: "HM" },
                { title: "Austin South", value: "$6,850 today", time: "Peak hour: 8AM - 9AM", code: "AI" }
              ].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 bg-white/45 p-3 rounded-[16px] border border-white/40">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-neutral-800 truncate leading-tight">
                      {task.title}
                    </span>
                    <span className="text-[11px] font-black text-[#ff385c] mt-0.5">
                      {task.value}
                    </span>
                    <span className="text-[9px] font-semibold text-neutral-400 mt-0.5">
                      {task.time}
                    </span>
                  </div>
                  
                  {/* Avatar & add button cluster */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-neutral-200 text-[8px] font-extrabold flex items-center justify-center text-neutral-600 border border-white shadow-sm">
                      {task.code}
                    </div>
                    <button className="h-5 w-5 rounded-full bg-[#ff385c] hover:bg-[#e00b41] text-white flex items-center justify-center transition-colors shadow-sm shadow-[#ff385c]/35">
                      <Plus size={10} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Center Card: "Sales Performance" (Larger, wider) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
            className="lg:col-span-6 lg:mt-8 bg-white/60 backdrop-blur-md border border-white/80 p-6 rounded-[24px] shadow-[0_12px_40px_0_rgba(255,56,92,0.05)] flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
                Sales Performance
              </span>
              <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100/60 text-neutral-400 hover:text-neutral-600 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
            
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-extrabold text-[#ff385c] leading-none">
                $28,420 Revenue
              </span>
            </div>

            {/* Alternating Pink Bar Chart */}
            <div className="h-28 flex items-end justify-between gap-1 mt-2 px-1">
              {[
                { height: 40, active: false },
                { height: 50, active: false },
                { height: 80, active: true },
                { height: 35, active: false },
                { height: 60, active: false },
                { height: 100, active: true },
                { height: 45, active: false },
                { height: 55, active: false },
                { height: 70, active: false },
                { height: 90, active: true },
                { height: 50, active: false },
                { height: 65, active: false }
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <motion.div 
                    className="w-full rounded-t-md cursor-pointer shadow-sm hover:opacity-90"
                    initial={{ height: "0%" }}
                    whileInView={{ height: `${bar.height}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.04, ease: "easeOut" }}
                    style={{
                      backgroundColor: bar.active ? "#ff385c" : "#ffd1da",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Month Labels */}
            <div className="flex justify-between text-[9px] font-bold text-neutral-400 mt-0.5 px-0.5 uppercase tracking-wider">
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
                <span key={m} className="flex-1 text-center">{m}</span>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-500 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff385c]" />
                <span>Gross Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd1da]" />
                <span>Loyalty Orders</span>
              </div>
            </div>
          </motion.div>

          {/* Right Card: "Customer Ratio" */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="lg:col-span-3 bg-white/60 backdrop-blur-md border border-white/80 p-5 rounded-[24px] shadow-[0_8px_32px_0_rgba(255,56,92,0.04)] flex flex-col gap-4"
          >
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-700">
              Customer Ratio
            </span>

            {/* Semi-donut gauge SVG */}
            <div className="relative w-full flex justify-center items-center mt-1">
              <svg className="w-full max-w-[150px] h-20" viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="rose-radial" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffd1da" />
                    <stop offset="100%" stopColor="#ff385c" />
                  </linearGradient>
                </defs>
                {/* Track arc */}
                <path
                  d="M 15,50 A 35,35 0 0,1 85,50"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Progress arc */}
                <motion.path
                  d="M 15,50 A 35,35 0 0,1 85,50"
                  stroke="url(#rose-radial)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="110"
                  initial={{ strokeDashoffset: 110 }}
                  whileInView={{ strokeDashoffset: 6.4 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Loyal Rate</span>
                <span className="text-lg font-black text-neutral-800 leading-none mt-0.5">94.2%</span>
              </div>
            </div>

            {/* Micro-analytics Legend details */}
            <div className="flex flex-col gap-2 text-[11px] font-bold text-neutral-600 mt-1">
              {[
                { label: "Loyal Customers", value: "55%", color: "bg-[#ff385c]" },
                { label: "New Visitors", value: "20%", color: "bg-[#ffa2b6]" },
                { label: "Reactivated", value: "15%", color: "bg-[#ffd1da]" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className="text-neutral-500 font-medium">{item.label}</span>
                  </div>
                  <span className="text-neutral-800">{item.value}</span>
                </div>
              ))}
            </div>

            <button className="w-full bg-white hover:bg-neutral-50 border border-neutral-200/80 rounded-xl py-2 text-[11px] font-bold text-neutral-500 transition-colors shadow-sm mt-1">
              Customer Details
            </button>
          </motion.div>

        </div>

      </div>

    </section>
  );
}
