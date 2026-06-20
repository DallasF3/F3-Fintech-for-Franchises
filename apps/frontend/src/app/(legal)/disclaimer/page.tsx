import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Disclaimer | FranchiseOS",
  description: "General software, financial, and predictive AI disclaimers.",
};

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Disclaimer
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. General Information</h2>
              <p>
                The information and services provided by FranchiseOS are for general operational and informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the software.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Not Financial Advice</h2>
              <p>
                FranchiseOS provides data analytics, sales tracking, and operational metrics. However, we are not financial advisors, accountants, or tax professionals. Any financial data, projections, or insights provided by the platform should not be construed as professional financial advice. You should consult with a certified professional before making significant financial decisions based on platform data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. AI Predictive Disclaimer</h2>
              <p>
                Our platform utilizes Artificial Intelligence (AI) to generate forecasts, recommendations, and executive briefings. Please be aware that:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>AI predictions are based on historical data patterns and are not guarantees of future performance.</li>
                <li>AI models can occasionally hallucinate or produce inaccurate conclusions.</li>
                <li>You are solely responsible for verifying AI-generated insights before taking action.</li>
              </ul>
              <p>
                FranchiseOS accepts no liability for business losses resulting from reliance on AI-generated forecasts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. "As Is" Service</h2>
              <p>
                The Service is provided on an "as is" and "as available" basis without any warranties. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
