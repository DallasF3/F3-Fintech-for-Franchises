"use client";

import { motion } from "framer-motion";
import { MessageSquare, Check } from "lucide-react";
import { Reveal } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const PROMPTS = [
  "Why are sales down at Store #12?",
  "Which locations are most at risk?",
  "Forecast revenue for next month",
  "Suggest a campaign for dormant customers",
];

const ANSWER =
  "Store #12 is down 14% week-over-week, driven mainly by a drop in repeat visits. Footfall held steady, but average ticket fell $3.20. I'd recommend a VIP win-back campaign. 86 lapsed regulars match the trigger.";

const bubble = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15, ease: EASE },
  }),
};

export function Copilot() {
  return (
    <section className="overflow-hidden border-y border-hairline-soft bg-ink py-24 text-white sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-rausch">
            AI Copilot
          </span>
          <h2 className="mt-4 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[44px]">
            Ask your business anything
          </h2>
          <p className="mt-5 max-w-xl text-[18px] leading-[1.6] text-white/70">
            A streaming chat copilot that understands your entire network. Ask
            in plain English and get answers grounded in your real data, with no
            dashboards to dig through.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Streaming, real-time responses",
              "Grounded in your live network data",
              "Powered by Claude with smart fallback",
            ].map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rausch text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-[16px] text-white/85">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:p-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rausch">
                <MessageSquare size={16} />
              </span>
              <span className="text-[15px] font-medium">Copilot</span>
            </div>

            <div className="mt-5 space-y-3">
              <motion.div
                custom={0}
                variants={bubble}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-rausch px-4 py-2.5 text-[14px] leading-snug text-white"
              >
                Why are sales down at Store #12?
              </motion.div>

              <motion.div
                custom={1}
                variants={bubble}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-[14px] leading-relaxed text-white/90"
              >
                {ANSWER}
              </motion.div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-white/60"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
