import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "CCPA Privacy Notice | FranchiseOS",
  description: "Privacy Notice for California Residents.",
};

export default function CCPAPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            CCPA Privacy Notice
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Scope and Applicability</h2>
              <p>
                This Privacy Notice for California Residents supplements the information contained in our general Privacy Policy and applies solely to all visitors, users, and others who reside in the State of California. We adopt this notice to comply with the California Consumer Privacy Act of 2018 (CCPA) and the California Privacy Rights Act (CPRA).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Categories of Personal Information Collected</h2>
              <p>Within the last 12 months, we have collected the following categories of personal information:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Identifiers:</strong> Name, email address, IP address, and account names.</li>
                <li><strong>Customer Records:</strong> Telephone number and financial information (processed securely).</li>
                <li><strong>Commercial Information:</strong> Records of products or services purchased or considered.</li>
                <li><strong>Internet Activity:</strong> Browsing history, search history, and interactions with our platform.</li>
                <li><strong>Geolocation Data:</strong> Physical location derived from IP addresses.</li>
                <li><strong>Professional Information:</strong> Job titles and business affiliations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. "Do Not Sell or Share My Personal Information"</h2>
              <p>
                <strong>We do not sell your personal information.</strong> We do not exchange your personal information for monetary or other valuable consideration with third parties. We may "share" information (as defined by the CPRA) for targeted advertising purposes through cookies.
              </p>
              <p>
                You have the right to opt-out of the sharing of your personal information for cross-context behavioral advertising. You can exercise this right by updating your cookie preferences or contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Your CCPA Rights</h2>
              <p>As a California resident, you have the right to request:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>The Right to Know:</strong> Disclosure of the specific pieces of personal information we have collected about you.</li>
                <li><strong>The Right to Delete:</strong> Deletion of your personal information, subject to certain exceptions.</li>
                <li><strong>The Right to Correct:</strong> Correction of inaccurate personal information.</li>
                <li><strong>The Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights (e.g., we will not deny you services or charge you different prices).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. How to Exercise Your Rights</h2>
              <p>
                To submit a verifiable consumer request to know, delete, or correct, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacy@[Website URL]<br />
                <strong>Address:</strong> [Business Address]
              </p>
              <p>
                We must verify your identity before processing your request. We will match the identifying information provided by you to the personal information we already maintain.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
