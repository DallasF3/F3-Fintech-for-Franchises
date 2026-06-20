import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Community Guidelines | FranchiseOS",
  description: "Rules for interacting within the FranchiseOS community.",
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Community Guidelines
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Overview</h2>
              <p>
                FranchiseOS provides collaborative features allowing users across franchise networks to communicate, share insights, and manage operations together. These guidelines ensure a safe, professional, and productive environment for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Be Professional and Respectful</h2>
              <p>
                Treat all members of your network and our support team with respect. Harassment, abusive language, discrimination, and personal attacks will not be tolerated. Keep communications focused on business operations and constructive feedback.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Protect Confidential Information</h2>
              <p>
                Do not share sensitive, proprietary, or confidential information (such as financial data from other franchises or trade secrets) in public or shared channels unless explicitly authorized to do so. Respect the data privacy of your colleagues and customers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Constructive Collaboration</h2>
              <p>
                When leaving notes, tasks, or comments within the platform, ensure they are clear, actionable, and helpful. Avoid spamming the platform with unnecessary notifications or irrelevant content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Enforcement</h2>
              <p>
                Violations of these guidelines may result in content removal, temporary suspension of collaborative features, or permanent account termination. We rely on our community to report inappropriate behavior to [Contact Email].
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
