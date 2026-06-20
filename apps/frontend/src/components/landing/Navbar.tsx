"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Company", href: "#features" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#cta" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      // Scroll Spy logic to detect active section using offsetTop
      const scrollPos = window.scrollY + 160; // offset for header height + buffer

      // Check if we are at the bottom of the page
      const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 60;
      if (isAtBottom) {
        setActiveTab("Contact");
        return;
      }

      const sectionIds = ["home", "features", "about", "cta"];
      let currentSection = "home";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          if (scrollPos >= el.offsetTop) {
            currentSection = id;
          }
        }
      }

      const idToLabel: Record<string, string> = {
        home: "Home",
        about: "About",
        features: "Company",
        cta: "Contact",
      };

      if (idToLabel[currentSection]) {
        setActiveTab(idToLabel[currentSection]);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-sm border-b border-neutral-200/80 ${
        scrolled
          ? "shadow-md shadow-black/5"
          : ""
      }`}
    >
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 sm:px-10">
        
        {/* Left Section: Brand Title only */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="text-[19px] font-bold tracking-tight text-neutral-400 font-sans">
            AI Franchise
          </span>
        </Link>

        {/* Middle Section: The Navigation Capsule */}
        <div className="hidden md:block">
          <div className="flex items-center gap-1 rounded-full bg-neutral-50/80 border border-neutral-200/85 px-1.5 py-1.5 shadow-[inset_0_1px_1px_rgba(0,0,0,0.01),0_2px_6px_rgba(0,0,0,0.03)]">
            {LINKS.map((link) => {
              const isActive = activeTab === link.label;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveTab(link.label)}
                  className="relative px-5 py-1.5 text-sm font-medium transition-colors duration-200"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 rounded-full bg-white border border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors duration-200 ${
                      isActive ? "text-rausch font-semibold" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {link.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Section: Call to Action (CTA) Button */}
        <div className="hidden md:flex items-center">
          <a
            href="/auth/signup"
            className="rounded-full bg-white text-neutral-400 border border-neutral-200/90 px-6 py-2 text-sm font-medium shadow-[-1px_1.5px_0px_rgba(0,0,0,0.02),_0_2px_6px_rgba(0,0,0,0.04)] hover:text-neutral-600 hover:border-neutral-300 transition-all duration-300"
          >
            Get Yours
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-neutral-200/80 md:hidden bg-white"
          >
            <div className="flex flex-col px-6 pb-8 pt-4 gap-4">
              {LINKS.map((link) => {
                const isActive = activeTab === link.label;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      setActiveTab(link.label);
                      setOpen(false);
                    }}
                    className={`py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-rausch font-semibold" : "text-neutral-400 hover:text-neutral-600"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/auth/signup"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-full bg-white text-center text-neutral-400 border border-neutral-200/90 py-3 text-sm font-medium shadow-[-1px_1.5px_0px_rgba(0,0,0,0.02),_0_2px_6px_rgba(0,0,0,0.04)] hover:text-neutral-600 transition-all"
              >
                Get Yours
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
