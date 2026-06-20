"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "./motion";

export function CTA() {
  return (
    <section id="cta" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-16 text-center sm:px-12 sm:py-24">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-rausch/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-rausch/20 blur-[100px]" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[48px]">
              Turn your franchise data into growth
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[18px] leading-[1.6] text-white/70">
              Join the franchisors and operators running their networks on
              Franchise OS. Connect your first system in minutes.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/auth/signup"
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rausch px-7 text-[16px] font-medium text-white transition-all hover:bg-rausch-active hover:shadow-[0_8px_28px_-6px_rgba(255,56,92,0.7)] sm:w-auto"
              >
                Start free trial
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
