import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Data Retention Policy | FranchiseOS",
  description: "How long we store your data and when it is deleted.",
};

export default function DataRetentionPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Data Retention Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Purpose</h2>
              <p>
                This Data Retention Policy outlines how long FranchiseOS stores different categories of data, ensuring we only keep information for as long as legally and operationally necessary.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Storage Timelines</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Active Account Data:</strong> Retained indefinitely while your account remains active and in good standing.</li>
                <li><strong>Transaction and Billing Records:</strong> Retained for a minimum of 7 years to comply with tax and financial regulations.</li>
                <li><strong>System Logs and Analytics:</strong> Standard logs are retained for 90 days. Aggregated, anonymized analytics data may be kept indefinitely for platform improvement.</li>
                <li><strong>AI Processing Context:</strong> Temporary context data sent to AI providers is discarded immediately after processing and is not retained by third-party models.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Conditions for Deletion</h2>
              <p>
                When you request account deletion, or if your account is terminated for violating our Terms of Service, we will initiate the data deletion process. User-identifiable data will be permanently deleted from our primary production databases within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Backup Retention</h2>
              <p>
                To ensure disaster recovery and system integrity, we maintain encrypted database backups. Data deleted from our primary systems may remain in these encrypted backups for up to an additional 90 days. After 90 days, the backups are automatically overwritten and the data is permanently destroyed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Legal Holds</h2>
              <p>
                Notwithstanding the above, we may retain specific data longer than outlined if required by a valid legal request, court order, or ongoing investigation.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
