import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Privacy Policy | FranchiseOS",
  description: "Learn how FranchiseOS collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Introduction</h2>
              <p>
                Welcome to FranchiseOS, Inc. ("Company", "we", "our", "us"). We respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit [Website URL] and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. Data Collected</h2>
              <p>We may collect the following types of data from you:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Name:</strong> Your first and last name.</li>
                <li><strong>Email:</strong> Your email address for communication and login.</li>
                <li><strong>Phone number:</strong> Your primary contact number.</li>
                <li><strong>Profile information:</strong> Job title, franchise roles, and preferences.</li>
                <li><strong>Authentication data:</strong> Passwords (hashed) and OAuth tokens.</li>
                <li><strong>Payment information:</strong> Processed securely (we do not store raw credit card numbers).</li>
                <li><strong>Device information:</strong> OS type, hardware models, and unique device identifiers.</li>
                <li><strong>IP address:</strong> Used for regional security and login tracking.</li>
                <li><strong>Browser type:</strong> Information to optimize your platform experience.</li>
                <li><strong>Cookies:</strong> Session and persistent trackers.</li>
                <li><strong>Usage analytics:</strong> Pages visited, features accessed, and interaction times.</li>
                <li><strong>Location data:</strong> General geolocation derived from IP addresses.</li>
                <li><strong>Uploaded content:</strong> Documents, images, or configurations you submit to the platform.</li>
                <li><strong>Support communications:</strong> Any data shared during customer service interactions.</li>
                <li><strong>Log files:</strong> Automated system and error logs for diagnostic purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Purpose of Data Collection</h2>
              <p>We use the collected data for the following specific purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Account creation:</strong> To set up and manage your platform access.</li>
                <li><strong>Authentication:</strong> To verify your identity during login.</li>
                <li><strong>Service delivery:</strong> To provide core features, dashboards, and AI analysis.</li>
                <li><strong>Payment processing:</strong> To handle subscriptions and billing securely.</li>
                <li><strong>Customer support:</strong> To resolve technical issues and answer inquiries.</li>
                <li><strong>Security and fraud prevention:</strong> To detect malicious activities and unauthorized access.</li>
                <li><strong>Analytics:</strong> To understand how the platform is used and track performance metrics.</li>
                <li><strong>Product improvement:</strong> To enhance our software and develop new features.</li>
                <li><strong>Notifications:</strong> To send important system alerts, reports, and updates.</li>
                <li><strong>Marketing:</strong> With your consent, to send promotional materials and newsletters.</li>
                <li><strong>Legal compliance:</strong> To adhere to regulatory requirements and tax laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. Third-Party Services</h2>
              <p>We may share data with the following categories of third-party services. Data is shared solely for operational purposes, protected by strict vendor agreements, and never sold.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication providers:</strong> (e.g., Google OAuth) Share basic profile and email data for secure sign-in.</li>
                <li><strong>Payment gateways:</strong> (e.g., Stripe) Securely process billing and subscription data.</li>
                <li><strong>Cloud hosting:</strong> (e.g., AWS, Vercel) Store application data securely in encrypted cloud environments.</li>
                <li><strong>Analytics services:</strong> Track usage trends to improve product stability.</li>
                <li><strong>Email providers:</strong> Facilitate the delivery of transactional and marketing emails.</li>
                <li><strong>AI providers:</strong> (e.g., Anthropic, OpenAI) Process anonymized or necessary context data to generate insights, forecasts, and briefings. No customer data is used to train public AI models.</li>
                <li><strong>CDN services:</strong> Ensure fast, localized delivery of platform assets.</li>
                <li><strong>Customer support platforms:</strong> Manage tickets and direct chat communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. User Rights</h2>
              <p>You maintain full control over your personal data. You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Access data:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Update data:</strong> Correct any inaccuracies in your profile.</li>
                <li><strong>Delete account:</strong> Request complete deletion of your account and associated personal data.</li>
                <li><strong>Export data:</strong> Download your data in a structured, commonly used format.</li>
                <li><strong>Withdraw consent:</strong> Revoke consent for data processing where previously granted.</li>
                <li><strong>Opt out of marketing:</strong> Unsubscribe from promotional emails at any time.</li>
                <li><strong>Cookie preferences:</strong> Adjust browser settings to reject non-essential cookies.</li>
                <li><strong>Lodge complaints:</strong> File a grievance with your local data protection authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">6. Security</h2>
              <p>We implement robust security measures to protect your data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Encryption:</strong> Data is encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                <li><strong>Secure authentication:</strong> Enforced password policies and OAuth integrations.</li>
                <li><strong>Access controls:</strong> Strict Role-Based Access Control (RBAC) and Row-Level Security (RLS) ensuring data isolation between franchises.</li>
                <li><strong>Monitoring:</strong> 24/7 automated monitoring for suspicious activities.</li>
                <li><strong>Data backups:</strong> Automated, encrypted backups stored in geographically distributed locations.</li>
                <li><strong>Incident response:</strong> Established protocols to address and mitigate any potential security breaches.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">7. Data Retention</h2>
              <p>We retain your data only for as long as necessary to fulfill the purposes outlined in this policy:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Active Accounts:</strong> We retain account data as long as your account remains active.</li>
                <li><strong>Conditions for deletion:</strong> Upon account closure, personal data is permanently deleted within 30 days unless required for legal compliance.</li>
                <li><strong>Backup retention:</strong> Encrypted backups are purged on a rolling 90-day cycle.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">8. Cookies</h2>
              <p>Our platform utilizes cookies to optimize your experience:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Essential cookies:</strong> Strictly necessary for platform operation, security, and user sessions.</li>
                <li><strong>Functional cookies:</strong> Remember your preferences and dashboard configurations.</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with the platform to improve design and performance.</li>
                <li><strong>Marketing cookies:</strong> Track the effectiveness of promotional campaigns.</li>
                <li><strong>Cookie management:</strong> You can manage or disable non-essential cookies via your browser settings or our dedicated cookie consent banner.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">9. International Compliance</h2>
              <p>We are committed to international data protection standards:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>GDPR (EU) & UK GDPR:</strong> We comply with data subject rights, lawful basis processing, and cross-border data transfer regulations.</li>
                <li><strong>CCPA (California):</strong> We uphold rights for California residents, including the right to know, delete, and opt-out of data sales.</li>
                <li><strong>General principles:</strong> We apply data minimization, purpose limitation, and transparency globally.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">10. Contact Us</h2>
              <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</p>
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
