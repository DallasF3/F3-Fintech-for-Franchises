"use client";

import { Reveal } from "./motion";

const INTEGRATIONS = [
  "Clover POS",
  "iAccess",
  "Purple WiFi",
  "Square",
  "Toast",
  "SendGrid",
  "Twilio",
  "Stripe",
  "Mailchimp",
  "Salesforce",
];

export function TrustBar() {
  return (
    <section className="border-y border-hairline-soft bg-surface-soft py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-[13px] font-medium uppercase tracking-[0.12em] text-muted">
            Connects to the systems your network already runs on
          </p>
        </Reveal>

        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-12">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((name, i) => (
              <span
                key={i}
                className="whitespace-nowrap text-[20px] font-semibold tracking-tight text-muted-soft transition-colors hover:text-ink"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
