"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Activity, AlertTriangle } from "lucide-react";

const BARS = [42, 58, 51, 70, 64, 82, 76, 94];

export function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-[18px] border border-hairline bg-canvas elev-1">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-hairline-soft bg-surface-soft px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="mx-auto flex items-center gap-2 rounded-md bg-canvas px-3 py-1 text-[12px] text-muted">
          app.franchiseos.ai/executive
        </div>
      </div>

      <div className="grid gap-4 p-4 text-left sm:grid-cols-3 sm:p-6">
        {/* Health score */}
        <div className="rounded-2xl border border-hairline-soft bg-canvas p-5">
          <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
            Network Health Score
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[44px] font-semibold leading-none tracking-tight text-ink">
              87
            </span>
            <span className="mb-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[12px] font-semibold text-emerald-600">
              <TrendingUp size={12} /> +4
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-strong">
            <motion.div
              className="h-full rounded-full bg-rausch"
              initial={{ width: 0 }}
              whileInView={{ width: "87%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="mt-3 text-[12px] text-muted">
            FHS™ across 128 locations
          </p>
        </div>

        {/* Revenue chart */}
        <div className="rounded-2xl border border-hairline-soft bg-canvas p-5">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
              Revenue
            </p>
            <Activity size={15} className="text-rausch" />
          </div>
          <p className="mt-2 text-[22px] font-semibold tracking-tight text-ink">
            $1.84M
          </p>
          <div className="mt-4 flex h-16 items-end justify-between gap-1.5">
            {BARS.map((h, i) => (
              <motion.div
                key={i}
                className={`w-full rounded-sm ${
                  i === BARS.length - 1 ? "bg-rausch" : "bg-rausch/25"
                }`}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + i * 0.06,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </div>

        {/* AI briefing */}
        <div className="rounded-2xl border border-rausch/20 bg-gradient-to-b from-rausch-soft/60 to-canvas p-5">
          <div className="flex items-center gap-1.5 text-rausch-active">
            <FileText size={15} />
            <p className="text-[12px] font-semibold uppercase tracking-wide">
              AI Briefing
            </p>
          </div>
          <p className="mt-3 text-[13px] leading-[1.5] text-body">
            <span className="font-semibold text-ink">3 stores</span> are
            trending below forecast. Downtown is your top expansion candidate
            this quarter.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-canvas/70 px-3 py-2 text-[12px] text-body">
            <AlertTriangle size={14} className="shrink-0 text-amber-500" />
            Refund spike detected at Store #44
          </div>
        </div>
      </div>
    </div>
  );
}
