import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "User Consent & Data Rights | FranchiseOS",
  description: "Learn how to exercise your data rights and manage your consent.",
};

export default function DataRightsPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            User Consent & Data Rights
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Taking Control of Your Data</h2>
              <p>
                At FranchiseOS, we believe that your data belongs to you. This page outlines the actionable steps you can take to manage your consent, update your preferences, or exercise your legal data rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Managing Consent</h2>
              
              <h3 className="mt-6 text-xl font-semibold text-ink">Marketing Communications</h3>
              <p>
                You can opt-out of receiving promotional emails at any time by clicking the "unsubscribe" link located at the bottom of any marketing email we send. Alternatively, you can update your notification preferences within your account dashboard. Note that you cannot opt-out of critical transactional emails (e.g., billing receipts, security alerts).
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">Cookie Preferences</h3>
              <p>
                You can withdraw your consent for non-essential cookies at any time by clearing your browser cookies and re-selecting your preferences upon refreshing the website, or by accessing the Cookie Management tool in the footer of our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Exercising Your Data Rights</h2>
              <p>Depending on your jurisdiction (e.g., under GDPR or CCPA), you have the right to request access to, correction of, or deletion of your personal data. Here is how you can submit those requests:</p>
              
              <h3 className="mt-6 text-xl font-semibold text-ink">How to Submit a Request</h3>
              <p>
                Please send an email to <strong>privacy@[Website URL]</strong> with the subject line "Data Subject Request". In your email, clearly state:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Your full name and the email address associated with your account.</li>
                <li>The specific right you wish to exercise (e.g., "Request for Data Export", "Request for Account Deletion").</li>
                <li>Any relevant context that will help us locate your data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Verification Process</h2>
              <p>
                For your protection, we must verify your identity before fulfilling any data subject request. We may ask you to confirm details associated with your account or send a verification link to your registered email address. We will not fulfill requests from unverified sources.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Response Timing</h2>
              <p>
                We aim to respond to all legitimate requests within 30 days. If your request is particularly complex or you have made a number of requests, it may take us longer. In such cases, we will notify you and keep you updated.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
