"use client";

import { Plug, ShieldCheck, Cpu, Target } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./motion";

const STEPS = [
  {
    icon: Plug,
    step: "01",
    title: "Connect your systems",
    body: "Link Clover, your payment processor, CRM and Purple WiFi in minutes via API, webhooks, or a simple CSV upload. Read-only, always.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "We normalize your data",
    body: "Every source maps to one canonical model. No raw card numbers are ever stored, only tokenized references and the metrics that matter.",
  },
  {
    icon: Cpu,
    step: "03",
    title: "AI gets to work",
    body: "Health scores, forecasts, anomaly alerts and customer segments are generated automatically and refreshed every day.",
  },
  {
    icon: Target,
    step: "04",
    title: "Act with confidence",
    body: "Launch campaigns, intervene on at-risk stores, and pick expansion markets, all from briefings written in plain English.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-hairline-soft bg-surface-soft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch">
            How it works
          </span>
          <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px]">
            Live in an afternoon, not a quarter
          </h2>
          <p className="mt-5 text-[18px] leading-[1.6] text-body">
            From first connection to your first AI briefing in four steps.
          </p>
        </Reveal>

        <Stagger className="relative mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <StaggerItem key={s.step}>
              <div className="relative h-full rounded-2xl border border-hairline-soft bg-canvas p-7">
                <span className="text-[44px] font-semibold leading-none tracking-tight text-surface-strong">
                  {s.step}
                </span>
                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
                  <s.icon size={20} />
                </div>
                <h3 className="mt-5 text-[19px] font-semibold tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[1.6] text-body">
                  {s.body}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
