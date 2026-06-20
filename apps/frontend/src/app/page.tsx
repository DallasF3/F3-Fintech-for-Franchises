import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustBar } from "@/components/landing/TrustBar";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Benefits } from "@/components/landing/Benefits";
import { Copilot } from "@/components/landing/Copilot";
import { Stats } from "@/components/landing/Stats";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[76px]">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Benefits />
        <Copilot />
        <Stats />
        <About />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
