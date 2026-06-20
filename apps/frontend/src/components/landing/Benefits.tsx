"use client";

import { Check, Building2, Store } from "lucide-react";
import { Reveal } from "./motion";

const AUDIENCES = [
  {
    icon: Building2,
    tag: "For Franchisors",
    title: "See your whole network at a glance",
    points: [
      "Network-wide health scoring and benchmarks",
      "Rank and compare every location instantly",
      "Spot at-risk stores before revenue drops",
      "Launch campaigns across the entire network",
      "Data-backed expansion recommendations",
    ],
  },
  {
    icon: Store,
    tag: "For Franchisees",
    title: "Run a stronger single store",
    points: [
      "Real-time revenue and transaction insight",
      "Know your customers and what brings them back",
      "Catch refund and chargeback issues early",
      "AI recommendations tailored to your store",
      "Anonymized benchmarks against top performers",
    ],
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch">
          Built for both sides
        </span>
        <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px]">
          Value the moment you log in
        </h2>
        <p className="mt-5 text-[18px] leading-[1.6] text-body">
          One platform, two perspectives. Each user sees exactly what they need
          and nothing they shouldn&apos;t.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        {AUDIENCES.map((a, i) => (
          <Reveal key={a.tag} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-hairline-soft bg-canvas p-8 sm:p-10">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink text-white">
                  <a.icon size={22} />
                </div>
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-rausch">
                  {a.tag}
                </span>
              </div>
              <h3 className="mt-6 text-[26px] font-semibold leading-tight tracking-tight text-ink">
                {a.title}
              </h3>
              <ul className="mt-6 space-y-3.5">
                {a.points.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rausch-soft text-rausch-active">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-[16px] leading-[1.5] text-body">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
