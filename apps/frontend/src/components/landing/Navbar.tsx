"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { label: "Home",    href: "#home"     },
  { label: "Company", href: "#features" },
  { label: "About",   href: "#about"    },
  { label: "Contact", href: "#cta"      },
];

export function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      const scrollPos  = window.scrollY + 160;
      const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;
      if (isAtBottom) { setActiveTab("Contact"); return; }

      const sectionIds = ["home", "features", "about", "cta"];
      let current = "home";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && scrollPos >= el.offsetTop) current = id;
      }

      const map: Record<string, string> = {
        home: "Home", features: "Company", about: "About", cta: "Contact",
      };
      if (map[current]) setActiveTab(map[current]);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-neutral-200/70 shadow-[0_1px_24px_rgba(0,0,0,0.07)]"
          : "bg-white/80 backdrop-blur-md border-b border-neutral-100/60"
      }`}
    >
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* ── Brand ── */}
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.span
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-[27px] leading-none bg-gradient-to-br from-[#ff385c] via-[#e00b41] to-[#b30033] bg-clip-text text-transparent"
            style={{ fontFamily: "var(--font-pacifico)" }}
          >
            F3
          </motion.span>
          <div className="hidden sm:flex items-center gap-2.5">
            <span className="h-4 w-px bg-neutral-200" />
            <span className="text-[11px] font-semibold tracking-widest text-neutral-400 uppercase">
              fintech for franchises
            </span>
          </div>
        </Link>

        {/* ── Nav capsule ── */}
        <div className="hidden md:block">
          <div className="flex items-center gap-0.5 rounded-full border border-neutral-200/70 bg-neutral-100/60 px-1 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            {LINKS.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveTab(link.label)}
                  className="relative px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-150"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-full bg-[#ff385c] shadow-[0_2px_10px_rgba(255,56,92,0.4)]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-150 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}>
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* ── Right CTAs ── */}
        <div className="hidden md:flex items-center gap-1.5">
          <a
            href="/auth/login"
            className="px-4 py-2 text-[13px] font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-all duration-200"
          >
            Log in
          </a>
          <a
            href="/auth/signup"
            className="group flex items-center gap-1.5 rounded-full bg-[#ff385c] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_16px_-2px_rgba(255,56,92,0.5)] hover:bg-[#e00b41] hover:shadow-[0_6px_20px_-2px_rgba(255,56,92,0.65)] transition-all duration-300"
          >
            Get Started
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* ── Mobile toggle ── */}
        <motion.button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="x"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{   rotate:  45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate:  45, opacity: 0 }}
                animate={{ rotate:  0,  opacity: 1 }}
                exit={{   rotate: -45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* ── Mobile dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="md:hidden border-t border-neutral-200/60 bg-white/96 backdrop-blur-xl"
          >
            <div className="flex flex-col px-4 pb-6 pt-2 gap-0.5">
              {LINKS.map((link) => {
                const isActive = activeTab === link.label;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => { setActiveTab(link.label); setOpen(false); }}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[#ff385c]/8 text-[#ff385c] font-semibold"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="mobileActiveDot"
                        className="h-1.5 w-1.5 rounded-full bg-[#ff385c]"
                      />
                    )}
                  </a>
                );
              })}

              <div className="mt-3 flex flex-col gap-2 border-t border-neutral-100 pt-4">
                <a
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="py-2.5 rounded-xl text-center text-[14px] font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                >
                  Log in
                </a>
                <a
                  href="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#ff385c] text-[14px] font-semibold text-white shadow-[0_4px_16px_-2px_rgba(255,56,92,0.45)] hover:bg-[#e00b41] transition-colors"
                >
                  Get Started
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
