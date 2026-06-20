import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "GDPR Compliance | FranchiseOS",
  description: "Our commitment to the General Data Protection Regulation.",
};

export default function GDPRPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            GDPR Compliance
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Our Commitment to GDPR</h2>
              <p>
                FranchiseOS is fully committed to compliance with the General Data Protection Regulation (GDPR) and the UK GDPR. We believe that privacy is a fundamental human right, and we have designed our platform architecture with data protection by design and by default.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Lawful Basis for Processing</h2>
              <p>We process your personal data under the following lawful bases:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Contractual Necessity:</strong> To fulfill our obligations under our Terms of Service (e.g., providing you access to the platform).</li>
                <li><strong>Legitimate Interests:</strong> For platform security, fraud prevention, and product improvement, provided these interests are not overridden by your rights.</li>
                <li><strong>Consent:</strong> For marketing communications and non-essential cookies. You may withdraw consent at any time.</li>
                <li><strong>Legal Obligation:</strong> To comply with tax, accounting, and regulatory requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Data Subject Rights</h2>
              <p>Under the GDPR, EU and UK residents have specific rights regarding their personal data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Right to Access</li>
                <li>The Right to Rectification</li>
                <li>The Right to Erasure (The "Right to be Forgotten")</li>
                <li>The Right to Restrict Processing</li>
                <li>The Right to Data Portability</li>
                <li>The Right to Object</li>
                <li>Rights concerning automated decision making and profiling</li>
              </ul>
              <p>
                To exercise any of these rights, please refer to our <a href="/data-rights" className="text-rausch hover:underline">Data Rights Page</a> or contact our Data Protection Officer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. International Data Transfers</h2>
              <p>
                FranchiseOS is headquartered in [Your Country]. If we transfer personal data originating from the EEA or the UK to a third country, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, or we ensure the destination country has an adequacy decision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Sub-processors</h2>
              <p>
                We use authorized third-party sub-processors to deliver our services (e.g., cloud hosting, analytics). We hold all sub-processors to strict data processing agreements that mandate GDPR-level security and privacy standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">6. Contact Our DPO</h2>
              <p>
                If you have specific questions regarding our GDPR compliance or wish to escalate a privacy concern, please contact our Data Protection Officer (DPO):
              </p>
              <p className="mt-2">
                <strong>Email:</strong> dpo@[Website URL]<br />
                <strong>Address:</strong> [Business Address]
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
