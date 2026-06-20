import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Health Score", href: "/#features" },
      { label: "Forecasting", href: "/#features" },
      { label: "AI Copilot", href: "/#features" },
      { label: "Marketing", href: "/#features" },
      { label: "Expansion", href: "/#features" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Careers", href: "/" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "/" },
      { label: "Integrations", href: "/" },
      { label: "Changelog", href: "/" },
      { label: "Status", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline-soft bg-canvas">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo />
              <span className="text-[17px] font-semibold tracking-tight text-ink">
                Franchise<span className="text-rausch">OS</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-[1.6] text-muted">
              The AI operating system for franchise growth. An intelligence
              layer over the systems you already run.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[14px] font-semibold text-ink">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[14px] text-muted transition-colors hover:text-rausch"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-hairline-soft pt-7 sm:flex-row">
          <p className="text-[13px] text-muted">
            © 2026 Franchise OS, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-muted">
            <a href="/privacy" className="transition-colors hover:text-rausch font-medium">
              Privacy
            </a>
            <a href="/terms" className="transition-colors hover:text-rausch font-medium">
              Terms
            </a>
            <a href="/security" className="transition-colors hover:text-rausch font-medium">
              Security
            </a>
            <a href="/rules" className="transition-colors hover:text-rausch font-medium">
              Rules
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
