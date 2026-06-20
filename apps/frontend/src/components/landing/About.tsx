"use client";

import { Activity, ShieldCheck, TrendingUp, Users, RefreshCw } from "lucide-react";
import { Stagger, StaggerItem, Reveal, motion } from "./motion";

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-hairline-soft bg-surface-soft py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch bg-rausch/10 px-3 py-1 rounded-full">
            Our Platform
          </span>
          <h2 className="mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[45px]">
            Engineered for Franchise Operations
          </h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-muted sm:text-[18px]">
            Deep dive into our analytical models, sync pipeline, and security mechanisms. F3 combines complex overnight data calculations into instant, actionable summaries.
          </p>
        </Reveal>
      </div>

      {/* Masonry / Pinterest Grid Container */}
      <Stagger className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
        
        {/* Card 1: Our Mission */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rausch bg-rausch-soft px-2.5 py-0.5 rounded-full">
              Mission
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-800">
            The Intelligence Layer for Franchise Growth
          </h3>
          <p className="text-sm leading-[1.6] text-neutral-500">
            Franchise networks generate enormous amounts of data across point of sale, payments, loyalty and footfall, yet most of it never turns into a decision. 
          </p>
          <p className="text-sm leading-[1.6] text-neutral-500">
            F3 is the secure intelligence layer that changes that: a single platform that understands every location, giving franchisors immediate guidance on where to intervene and where to expand.
          </p>
          <div className="mt-2 h-1.5 w-1/3 rounded-full bg-gradient-to-r from-rausch to-indigo-500" />
        </StaggerItem>

        {/* Card 2: Revenue Forecasting (Graph) */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
              Cash Flow Analysis
            </h4>
            <TrendingUp size={16} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              30/60/90-Day Cash Forecasts
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              95% confidence intervals based on historical POS signals.
            </p>
          </div>
          
          {/* Ultra Premium Line Chart SVG */}
          <div className="w-full bg-neutral-50 rounded-xl p-4 border border-neutral-100 mt-2">
            <svg className="w-full h-36" viewBox="0 0 300 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.01"/>
                </linearGradient>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff385c"/>
                  <stop offset="60%" stopColor="#818cf8"/>
                  <stop offset="100%" stopColor="#6366f1"/>
                </linearGradient>
              </defs>
              
              {/* Gridlines */}
              <line x1="30" y1="20" x2="280" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="55" x2="280" y2="55" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="90" x2="280" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="125" x2="280" y2="125" stroke="#e2e8f0" strokeWidth="1.5" />
              
              {/* Confidence Band Polygon */}
              <motion.path 
                d="M120,95 L180,60 L240,40 L280,30 L280,75 L240,90 L180,110 L120,115 Z" 
                fill="url(#area-gradient)" 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
              
              {/* Forecast boundary dashed lines */}
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
              
              {/* Median Trend Line */}
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
              
              {/* Pivot Indicator */}
              <circle cx="120" cy="105" r="4.5" fill="#ffffff" stroke="#ff385c" strokeWidth="2.5" />
              <line x1="120" y1="10" x2="120" y2="125" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
              
              {/* Labelings */}
              <text x="25" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">JUN</text>
              <text x="110" y="137" fill="#ff385c" fontSize="8" fontWeight="700">NOW</text>
              <text x="190" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">AUG</text>
              <text x="265" y="137" fill="#94a3b8" fontSize="8" fontWeight="600">OCT</text>
            </svg>
          </div>
        </StaggerItem>

        {/* Card 3: Franchise Health Score (Radial chart) */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
              Franchise Health Score
            </h4>
            <Activity size={16} className="text-rausch" />
          </div>
          
          <div className="flex items-center gap-6 mt-2">
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-rausch"
                  strokeDasharray="100"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDashoffset: 100 }}
                  whileInView={{ strokeDashoffset: 6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-neutral-800 leading-none">9.4</span>
                <span className="text-[8px] font-bold uppercase text-neutral-400 mt-0.5">FHS™</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-base font-bold text-neutral-800">Outstanding Health</span>
              <p className="text-xs text-neutral-400 mt-1 leading-[1.4]">
                9 factors synthesized across transaction velocity, ticket sizes, and customer churn.
              </p>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2.5 mt-2">
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
                  className="h-full bg-rausch rounded-full" 
                  initial={{ width: "0%" }}
                  whileInView={{ width: "88%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Card 4: POS & Sync Flows */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
              Modular Integrations
            </h4>
            <RefreshCw size={16} className="text-neutral-400 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Live Queue Sync Engine
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Ingests raw Clover POS, WiFi footfall, and iAccess merchant settlement webhooks.
            </p>
          </div>

          {/* Custom SVG diagram */}
          <div className="w-full bg-neutral-50 rounded-xl p-4 border border-neutral-100 mt-2 flex justify-center">
            <svg className="w-full max-w-[280px] h-24" viewBox="0 0 280 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Connector paths */}
              <path d="M60,20 L135,45 M60,45 L135,45 M60,70 L135,45" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M195,45 L235,45" stroke="#818cf8" strokeWidth="2" />
              
              {/* Nodes Left */}
              <rect x="5" y="10" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <text x="12" y="22" fill="#64748b" fontSize="8" fontWeight="600">Clover POS</text>
              
              <rect x="5" y="36" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <text x="10" y="48" fill="#64748b" fontSize="8" fontWeight="600">iAccess Pay</text>
              
              <rect x="5" y="62" width="55" height="18" rx="4" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
              <text x="12" y="74" fill="#64748b" fontSize="8" fontWeight="600">Purple WiFi</text>
              
              {/* Center Queue */}
              <rect x="135" y="28" width="60" height="34" rx="6" fill="#1e1b4b" />
              <text x="144" y="44" fill="#818cf8" fontSize="8" fontWeight="700">BULLMQ</text>
              <text x="142" y="53" fill="#ffffff" fontSize="7" fontWeight="500">Sync Queue</text>
              
              {/* Right Db */}
              <circle cx="255" cy="45" r="18" fill="#ff385c" />
              <svg x="247" y="37" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
              </svg>
            </svg>
          </div>
        </StaggerItem>

        {/* Card 5: Customer Segments */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
              Customer Lifecycle
            </h4>
            <Users size={16} className="text-neutral-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              RFM Segmentation Models
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Categorize users automatically by Recency, Frequency, and Monetary parameters.
            </p>
          </div>

          {/* Segmented Horizontal Block Bar */}
          <div className="h-6 w-full flex rounded-lg overflow-hidden border border-neutral-100 mt-1">
            <motion.div 
              className="h-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white" 
              initial={{ width: "0%" }}
              whileInView={{ width: "45%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              title="Active (45%)"
            >
              45%
            </motion.div>
            <motion.div 
              className="h-full bg-rausch flex items-center justify-center text-[10px] font-bold text-white border-l border-white" 
              initial={{ width: "0%" }}
              whileInView={{ width: "25%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              title="Loyal (25%)"
            >
              25%
            </motion.div>
            <motion.div 
              className="h-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white border-l border-white" 
              initial={{ width: "0%" }}
              whileInView={{ width: "18%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              title="At Risk (18%)"
            >
              18%
            </motion.div>
            <motion.div 
              className="h-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-500 border-l border-white" 
              initial={{ width: "0%" }}
              whileInView={{ width: "12%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              title="Lost (12%)"
            >
              12%
            </motion.div>
          </div>

          {/* Segment Legend */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 block" />
              <span>Active Growth: 45%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rausch block" />
              <span>Core Loyalists: 25%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
              <span>At Churn Risk: 18%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200 block" />
              <span>Inactive Leads: 12%</span>
            </div>
          </div>
        </StaggerItem>

        {/* Card 6: Security and Isolation */}
        <StaggerItem className="break-inside-avoid bg-white p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-neutral-400">
              Data Isolation
            </h4>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-neutral-800">
            Row-Level Tenant Isolation
          </h3>
          <p className="text-sm leading-[1.6] text-neutral-500">
            Security is built straight into the core database level. We enforce strict PostgreSQL **Row-Level Security (RLS)** policies on all tables containing store, client, and transaction parameters. 
          </p>
          <p className="text-sm leading-[1.6] text-neutral-500">
            No cross-tenant data leaks, read-only system integrations, and completely tokenized card reference ids.
          </p>
        </StaggerItem>

      </Stagger>
    </section>
  );
}
