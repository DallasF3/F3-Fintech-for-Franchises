"use client";

import {
  Gauge,
  LineChart,
  FileText,
  Megaphone,
  Shield,
  MapPin,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-5 py-24 sm:px-8 sm:py-32 bg-white">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch bg-rausch/10 px-3 py-1 rounded-full">
          The Platform
        </span>
        <h2 className="mt-5 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[45px]">
          One Intelligence Layer, Entire Network
        </h2>
        <p className="mt-4 text-[16px] leading-[1.6] text-muted sm:text-[18px]">
          AI Franchise sits on top of the systems you already use POS, payments, loyalty, and hardware and translates their data into decisions.
        </p>
      </Reveal>

      {/* Masonry Pinterest Grid */}
      <Stagger className="mx-auto mt-16 max-w-7xl columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
        
        {/* Card 1: Franchise Health Score */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rausch/10 text-rausch">
              <Gauge size={20} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Score System
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Franchise Health Score™
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              A single 0 to 100 score per location, blending 9 weighted factors like revenue growth, footfall retention, refunds, and chargebacks.
            </p>
          </div>
          
          {/* Widget: Score List */}
          <div className="bg-white rounded-xl p-3 border border-neutral-200/60 mt-1 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-600">Location #102 (Downtown)</span>
              <span className="font-bold text-emerald-500">89/100</span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "89%" }} />
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="font-semibold text-neutral-600">Location #204 (Suburbs)</span>
              <span className="font-bold text-amber-500">54/100</span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "54%" }} />
            </div>
          </div>
        </StaggerItem>

        {/* Card 2: Daily AI Executive Briefings */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={20} />
            </div>
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Daily AI Executive Briefings
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              Wake up to a plain-language summary of what happened across your network, why it happened, and exactly where to intervene today.
            </p>
          </div>
          
          {/* Widget: Chat Bubble mockup */}
          <div className="bg-indigo-950 text-white rounded-xl p-3.5 border border-indigo-900/60 mt-1 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Overnight Insight</span>
            </div>
            <p className="text-[11px] leading-[1.5] text-indigo-100">
              &quot;Austin location showed a 14% customer retention spike. Recommending immediate dispatch of SMS coupon recovery campaign for unredeemed leads.&quot;
            </p>
          </div>
        </StaggerItem>

        {/* Card 3: Revenue Forecasting */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <LineChart size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Revenue Projections
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              30, 60, and 90-day projections for revenue, royalties, and refunds, with conservative, expected, and aggressive forecast models.
            </p>
          </div>
          
          {/* Widget: Mini Projection Table */}
          <div className="bg-white rounded-xl border border-neutral-200/60 overflow-hidden mt-1">
            <div className="bg-neutral-100/60 px-3 py-1.5 border-b border-neutral-200 text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
              <span>Timeline</span>
              <span>Proj. Revenue</span>
            </div>
            <div className="p-3 flex flex-col gap-2 text-xs font-semibold text-neutral-600">
              <div className="flex justify-between items-center">
                <span>30 Days</span>
                <span className="text-neutral-800">+$14,200</span>
              </div>
              <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "35%" }} />
              </div>
              <div className="flex justify-between items-center">
                <span>60 Days</span>
                <span className="text-neutral-800">+$32,600</span>
              </div>
              <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Card 4: Refund & Chargeback */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Shield size={20} />
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
              Active Alerts
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Chargeback Safeguards
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              Anomaly detection flags refund spikes and chargeback patterns per location, providing automatic risk scoring and email alerts.
            </p>
          </div>
          
          {/* Widget: Risk Alert card */}
          <div className="bg-white p-3 rounded-xl border border-red-100 flex items-center gap-3 mt-1 shadow-sm shadow-red-500/5">
            <div className="h-8 w-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-800">Refund Spike Detected</span>
              <span className="text-[9px] text-neutral-400">Location #104: 3 refunds in 15 mins</span>
            </div>
          </div>
        </StaggerItem>

        {/* Card 5: Marketing Automation */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rausch/10 text-rausch-active">
              <Megaphone size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Campaign Automation
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              Trigger automated email, SMS, and coupon campaigns when loyalty footfall drops. Reactivation, recovery, and VIP campaigns.
            </p>
          </div>
          
          {/* Widget: SMS mockup */}
          <div className="bg-neutral-800 text-white rounded-2xl p-3 max-w-[220px] ml-auto border border-neutral-700 shadow-sm relative">
            <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wide block mb-1">Text Notification</span>
            <p className="text-[10px] leading-[1.4] text-neutral-200">
              &quot;Hey Alex! It&apos;s been 3 weeks. Enjoy a free coffee on your next visit to downtown! Code: CAFE20 ☕&quot;
            </p>
            <div className="absolute -bottom-1 right-4 w-3.5 h-3.5 bg-neutral-800 border-r border-b border-neutral-700 transform rotate-45" />
          </div>
        </StaggerItem>

        {/* Card 6: Expansion Intelligence */}
        <StaggerItem className="break-inside-avoid bg-neutral-50/50 p-6 rounded-[22px] border border-neutral-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <MapPin size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-neutral-800">
              Expansion Intelligence
            </h3>
            <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
              Rank expansion areas by analyzing demographic density, competitor profiles, and multi-location index benchmarks.
            </p>
          </div>
          
          {/* Widget: Expansion List */}
          <div className="bg-white rounded-xl p-3 border border-neutral-200/60 mt-1 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-neutral-600 border-b border-neutral-100 pb-1.5">
              <span>Seattle Metro</span>
              <span className="text-emerald-500">Rank #1 (Score: 92)</span>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-neutral-600">
              <span>Austin South</span>
              <span className="text-emerald-500">Rank #2 (Score: 88)</span>
            </div>
          </div>
        </StaggerItem>

      </Stagger>
    </section>
  );
}
