"use client";

import { Counter, Reveal, Stagger, StaggerItem } from "./motion";

const STATS = [
  { value: 9, suffix: "", label: "Health factors scored per location" },
  { value: 24, suffix: "/7", label: "Anomaly monitoring across the network" },
  { value: 90, suffix: "-day", label: "Revenue forecasting horizon" },
  { value: 5, suffix: "×", label: "Data sources unified into one model" },
];

export function Stats() {
  return (
    <section id="results" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch">
          The numbers
        </span>
        <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink sm:text-[44px]">
          Intelligence that compounds
        </h2>
      </Reveal>

      <Stagger className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {STATS.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-2xl border border-hairline-soft bg-surface-soft p-7 text-center">
              <p className="text-[44px] font-semibold leading-none tracking-tight text-ink sm:text-[52px]">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-[14px] leading-snug text-muted">
                {s.label}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
