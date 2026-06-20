import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Contact & Grievance Policy | FranchiseOS",
  description: "How to contact us with legal notices or file a formal grievance.",
};

export default function ContactGrievancePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Contact & Grievance Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. General Inquiries</h2>
              <p>
                For general support, sales inquiries, or questions about how to use the FranchiseOS platform, please contact our customer support team:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> support@[Website URL]<br />
                <strong>Phone:</strong> [Support Phone Number]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Legal Notices</h2>
              <p>
                All formal legal notices, subpoenas, or correspondence regarding our Terms of Service should be directed to our legal department in writing:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> legal@[Website URL]<br />
                <strong>Mailing Address:</strong><br />
                FranchiseOS, Inc.<br />
                Attn: Legal Department<br />
                [Business Address]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Privacy Concerns and DPO</h2>
              <p>
                If you have concerns about data privacy, security, or wish to escalate an issue regarding your personal data, please contact our Data Protection Officer (DPO):
              </p>
              <p className="mt-2">
                <strong>Email:</strong> dpo@[Website URL]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Grievance Redressal Mechanism</h2>
              <p>
                If you are dissatisfied with our services or believe we have violated our own policies, you may file a formal grievance. We take all grievances seriously and aim to resolve them fairly and transparently.
              </p>
              
              <h3 className="mt-6 text-xl font-semibold text-ink">How to File a Grievance</h3>
              <p>
                Submit your grievance via email to <strong>grievance@[Website URL]</strong>. Please include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>A detailed description of the issue.</li>
                <li>Relevant dates, times, and account details.</li>
                <li>Any supporting documentation or screenshots.</li>
                <li>The outcome you are seeking.</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">Resolution Timeline</h3>
              <p>
                We will acknowledge receipt of your grievance within 48 hours. Our Grievance Officer will review the matter and provide a formal response or resolution plan within 15 business days.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
