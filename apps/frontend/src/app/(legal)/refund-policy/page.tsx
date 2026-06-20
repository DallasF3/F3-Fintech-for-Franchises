import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Refund and Cancellation Policy | FranchiseOS",
  description: "Details regarding subscriptions, cancellations, and refunds.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Refund and Cancellation Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Subscription Plans</h2>
              <p>
                FranchiseOS operates on a recurring subscription model (monthly or annually). By subscribing, you agree to automatic renewals until the subscription is actively cancelled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Trial Periods</h2>
              <p>
                If your subscription begins with a free trial, you will not be charged until the trial period expires. You may cancel at any time during the trial period to avoid being billed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Cancellation Process</h2>
              <p>
                You may cancel your subscription at any time through the "Billing" section of your FranchiseOS dashboard or by contacting our support team. Cancellations take effect at the end of the current paid billing cycle, meaning you will retain access to the platform until that cycle ends.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Non-Refundable Services</h2>
              <p>
                As a standard policy, we do not offer refunds or credits for partial months of service, downgrade refunds, or refunds for months unused with an open account. Set-up fees, custom integration fees, and dedicated onboarding services are entirely non-refundable once the service has commenced.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Subscription Refunds</h2>
              <p>
                For annual subscriptions, if you forget to cancel before the auto-renewal date, you may request a refund within 7 days of the renewal charge. Monthly subscription renewals are strictly non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">6. Exceptional Circumstances</h2>
              <p>
                We recognize that exceptional circumstances take place. We may, at our sole discretion, issue a refund if the platform experiences significant, prolonged downtime that violates our Service Level Agreement (SLA), or if a billing error occurs on our end.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">7. Contact for Billing Issues</h2>
              <p>If you have any questions or disputes regarding billing, please contact us:</p>
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
