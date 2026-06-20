import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Acceptable Use Policy | FranchiseOS",
  description: "Rules outlining the acceptable and prohibited uses of FranchiseOS.",
};

export default function AcceptableUsePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Acceptable Use Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Purpose</h2>
              <p>
                This Acceptable Use Policy sets forth the rules and guidelines for using the FranchiseOS platform. By using our services, you agree to comply with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Prohibited Activities</h2>
              <p>You agree not to use the platform in any of the following ways:</p>
              
              <h3 className="mt-6 text-xl font-semibold text-ink">2.1 Illegal Activities</h3>
              <p>
                Using the platform for any illegal, fraudulent, or unauthorized purpose, including violating any local, state, national, or international laws.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.2 Spam and Phishing</h3>
              <p>
                Sending unsolicited bulk communications, spam, or engaging in phishing or social engineering attacks against our users or third parties.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.3 Malware and Hacking Attempts</h3>
              <p>
                Uploading, distributing, or executing viruses, worms, trojans, or any malicious code. Attempting to probe, scan, or test the vulnerability of any FranchiseOS system or network.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.4 Harassment and Hate Speech</h3>
              <p>
                Using the platform to harass, abuse, insult, defame, slander, or intimidate anyone based on gender, sexual orientation, religion, ethnicity, race, age, or disability.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.5 IP Infringement</h3>
              <p>
                Uploading or sharing content that infringes on the intellectual property rights of others, including copyrights, trademarks, or trade secrets.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.6 Abuse of AI Features</h3>
              <p>
                Intentionally using the platform's AI tools to generate harmful, misleading, or illegal content. Attempting to prompt-inject, jailbreak, or reverse-engineer the underlying AI models.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.7 Automated Scraping</h3>
              <p>
                Using automated scripts, bots, spiders, or scrapers to access, copy, or extract data from the platform without our prior written consent.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">2.8 Platform Misuse</h3>
              <p>
                Imposing an unreasonable or disproportionately large load on our infrastructure, or interfering with the proper working of the platform for other users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Enforcement</h2>
              <p>
                We reserve the right, but do not have the obligation, to monitor use of the platform. If we determine that you have violated this Acceptable Use Policy, we may take appropriate action, including issuing a warning, suspending your account, or permanently terminating your access to the platform without refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Reporting Violations</h2>
              <p>If you suspect a violation of this policy, please report it immediately to:</p>
              <p className="mt-2">
                <strong>Email:</strong> [Contact Email]
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
