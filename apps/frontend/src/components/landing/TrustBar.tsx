"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const INTEGRATIONS = [
  { name: "Clover POS",  cls: "bg-green-50 text-green-700 border-green-200"     },
  { name: "iAccess",     cls: "bg-blue-50 text-blue-700 border-blue-200"        },
  { name: "Purple WiFi", cls: "bg-purple-50 text-purple-700 border-purple-200"  },
  { name: "Square",      cls: "bg-neutral-100 text-neutral-700 border-neutral-200" },
  { name: "Toast",       cls: "bg-orange-50 text-orange-700 border-orange-200"  },
  { name: "SendGrid",    cls: "bg-sky-50 text-sky-700 border-sky-200"           },
  { name: "Twilio",      cls: "bg-red-50 text-red-600 border-red-200"           },
  { name: "Stripe",      cls: "bg-indigo-50 text-indigo-700 border-indigo-200"  },
  { name: "Mailchimp",   cls: "bg-yellow-50 text-yellow-700 border-yellow-200"  },
  { name: "Salesforce",  cls: "bg-cyan-50 text-cyan-700 border-cyan-200"        },
];

export function TrustBar() {
  return (
    <section className="border-y border-neutral-200/60 bg-white py-10">
      <motion.p
        className="text-[12px] font-bold uppercase tracking-[0.14em] text-neutral-400 text-center mb-8"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        Integrates with the tools you already use
      </motion.p>

      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee gap-3 px-3">
          {[...INTEGRATIONS, ...INTEGRATIONS].map((item, i) => (
            <span
              key={i}
              className={`inline-flex items-center whitespace-nowrap text-[13px] font-semibold px-3.5 py-1.5 rounded-full border ${item.cls}`}
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
