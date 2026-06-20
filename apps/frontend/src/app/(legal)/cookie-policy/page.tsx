import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Cookie Policy | FranchiseOS",
  description: "Information about how we use cookies and tracking technologies.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information and personalized experiences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. How We Use Cookies</h2>
              <p>
                FranchiseOS uses cookies and similar tracking technologies to track activity on our platform and store certain information. The cookies we use fall into the following categories:
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Types of Cookies We Use</h2>
              
              <h3 className="mt-6 text-xl font-semibold text-ink">3.1 Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with the services available through our platform and to use some of its features, such as secure login, session management, and load balancing. Without these cookies, the platform cannot function properly.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">3.2 Functional Cookies</h3>
              <p>
                These cookies allow us to remember choices you make when you use the platform, such as remembering your dashboard layout preferences or regional settings. The purpose of these cookies is to provide you with a more personal experience.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">3.3 Analytics Cookies</h3>
              <p>
                We use analytics cookies to track information about traffic to the platform and how users interact with it. The information gathered may include your IP address, browser type, and interaction metrics. We use this data strictly to improve the platform's performance and design.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">3.4 Marketing Cookies</h3>
              <p>
                These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad. These cookies can share that information with other organizations or advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Cookie Management Options</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in our Cookie Consent Banner upon your first visit.
              </p>
              <p>
                Additionally, you can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our platform, though your access to some functionality and secure areas may be restricted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Contact Us</h2>
              <p>If you have any questions about our use of cookies, please contact us at:</p>
              <p className="mt-2">
                <strong>Email:</strong> [Contact Email]<br />
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
