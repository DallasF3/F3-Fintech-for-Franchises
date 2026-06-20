import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Security Policy | FranchiseOS",
  description: "Information regarding our platform security and user responsibilities.",
};

export default function SecurityPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Security Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Our Commitment</h2>
              <p>
                At FranchiseOS, security is integrated into every layer of our platform. We employ industry-standard practices to protect your data from unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Infrastructure Security</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</li>
                <li><strong>Access Control:</strong> We use strict Role-Based Access Control (RBAC) and Row-Level Security (RLS) to ensure tenant isolation.</li>
                <li><strong>Monitoring:</strong> Our infrastructure is continuously monitored for anomalous activity, intrusion attempts, and availability.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. User Responsibilities</h2>
              <p>Security is a shared responsibility. You are required to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Password Security:</strong> Use strong, unique passwords and never share your credentials with others.</li>
                <li><strong>Account Protection:</strong> Enable multi-factor authentication (MFA) if available and ensure your device is secured.</li>
                <li><strong>Phishing Awareness:</strong> Be vigilant against phishing attempts. We will never ask for your password via email or chat.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Reporting Vulnerabilities</h2>
              <p>
                If you discover a security vulnerability in our platform, please report it immediately to our security team at [Contact Email]. Please do not disclose the vulnerability publicly until we have had a reasonable timeframe to address it. We deeply appreciate the work of security researchers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Breach Notification Process</h2>
              <p>
                In the highly unlikely event of a data breach that compromises your personal information, we will notify you and relevant regulatory authorities without undue delay (and within 72 hours where required by law). Our notification will outline the nature of the breach, the data affected, and the steps we are taking to mitigate the impact.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
