import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Community Rules | FranchiseOS",
  description: "FranchiseOS Community Rules and Code of Conduct.",
};

export default function RulesPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Community Rules & Code of Conduct
          </h1>
          <p className="mt-4 text-lg text-muted">
            Last Updated: June 2026
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                1. Introduction
              </h2>
              <p>
                FranchiseOS is committed to fostering a professional, respectful, and collaborative
                community. These Community Rules and Code of Conduct apply to all users,
                regardless of plan or role. By using FranchiseOS, you agree to adhere to
                these standards.
              </p>
              <p>
                Our goal is to create an environment where franchise owners, operators, and team
                members can succeed together. We expect all members to conduct themselves
                professionally and ethically.
              </p>
            </section>

            {/* Core Values */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                2. Core Community Values
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                2.1 Respect
              </h3>
              <p>
                We respect the diversity of our community. Members come from different
                backgrounds, cultures, and business models. We value all perspectives and
                expect members to treat each other with dignity.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                2.2 Integrity
              </h3>
              <p>
                Honesty and ethical behavior are fundamental. We expect members to be truthful
                about their data, follow applicable laws, and conduct business ethically.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                2.3 Collaboration
              </h3>
              <p>
                Success comes through collaboration. Members are encouraged to share best
                practices, support each other, and contribute positively to the community.
              </p>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                2.4 Professionalism
              </h3>
              <p>
                FranchiseOS is a professional platform for business. All interactions should
                maintain professional standards and decorum.
              </p>
            </section>

            {/* Conduct Standards */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                3. Expected Conduct Standards
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                3.1 Respectful Communication
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Communicate respectfully with all community members</li>
                <li>Avoid harassment, discrimination, or bullying</li>
                <li>
                  Not use offensive, abusive, or derogatory language related to race, ethnicity,
                  religion, gender, sexual orientation, or disability
                </li>
                <li>Avoid personal attacks or ad hominem arguments</li>
                <li>Disagree constructively and professionally</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                3.2 Confidentiality
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Respect confidential business information of other franchises</li>
                <li>Not share proprietary strategies or trade secrets without permission</li>
                <li>
                  Understand that performance metrics and benchmarks shared in the community
                  are confidential
                </li>
                <li>Not use information to gain unfair competitive advantage</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                3.3 Intellectual Property
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Respect intellectual property rights of others</li>
                <li>Not copy, distribute, or modify another member&apos;s content without permission</li>
                <li>Properly attribute ideas and content from other members</li>
                <li>
                  Understand that FranchiseOS retains rights to aggregated, anonymized insights
                </li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                3.4 Legal Compliance
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Comply with all applicable laws and regulations in their jurisdiction</li>
                <li>Not use FranchiseOS for illegal purposes or activities</li>
                <li>Not facilitate or encourage illegal activity</li>
                <li>Ensure that franchise relationships comply with franchise disclosure laws</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                3.5 Fraud Prevention
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Not engage in fraudulent activity or misrepresentation</li>
                <li>Provide accurate financial and operational data</li>
                <li>Not manipulate data or metrics to gain unfair advantage</li>
                <li>Not impersonate other users or organizations</li>
              </ul>
            </section>

            {/* Prohibited Behavior */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                4. Prohibited Behavior
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                4.1 Harassment & Abuse
              </h3>
              <p>The following are strictly prohibited:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>
                  Unwanted sexual advances or harassment of any kind
                </li>
                <li>
                  Deliberate intimidation or threats
                </li>
                <li>
                  Stalking or persistent unwanted contact
                </li>
                <li>
                  Doxing (sharing private information without consent)
                </li>
                <li>
                  Coordinated harassment campaigns
                </li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                4.2 Hate Speech & Discrimination
              </h3>
              <p>
                Content that attacks individuals or groups based on protected characteristics
                is prohibited. This includes but is not limited to:
              </p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Race or ethnicity</li>
                <li>Religion or belief system</li>
                <li>Gender or gender identity</li>
                <li>Sexual orientation</li>
                <li>Disability or medical condition</li>
                <li>National origin or immigration status</li>
                <li>Age or other protected status</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                4.3 Spam & Abuse
              </h3>
              <p>The following are prohibited:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Spam, phishing, or scam messages</li>
                <li>Unsolicited marketing or promotional content</li>
                <li>Automated abuse of platform features</li>
                <li>Malware or security threats</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                4.4 Misinformation
              </h3>
              <p>Members must not:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>
                  Deliberately spread false or misleading information
                </li>
                <li>
                  Misrepresent data or manipulate statistics
                </li>
                <li>
                  Spread conspiracy theories or unfounded allegations
                </li>
                <li>
                  Impersonate FranchiseOS staff or officials
                </li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                4.5 Commercial Violations
              </h3>
              <p>Members must not:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Violate franchise agreement terms</li>
                <li>Engage in pyramid schemes or multi-level marketing violations</li>
                <li>Breach non-compete or confidentiality agreements</li>
                <li>Improperly use competitive information</li>
                <li>Manipulate payment or refund systems</li>
              </ul>
            </section>

            {/* Data & Security */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                5. Data & Security Responsibilities
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                5.1 Data Integrity
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Ensure that all data entered into FranchiseOS is accurate</li>
                <li>Not deliberately input false or misleading data</li>
                <li>Maintain data in a timely and consistent manner</li>
                <li>Correct errors when discovered</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                5.2 Account Security
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Keep passwords secure and never share them</li>
                <li>Enable multi-factor authentication</li>
                <li>Not attempt to gain unauthorized access to other accounts</li>
                <li>Report suspicious activity immediately</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                5.3 PII & Sensitive Information
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Not input unnecessary personal information</li>
                <li>Protect customer and employee data they collect</li>
                <li>Comply with privacy regulations (GDPR, CCPA, etc.)</li>
                <li>Never store payment card information in FranchiseOS</li>
              </ul>
            </section>

            {/* Fair Competition */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                6. Fair Competition
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                6.1 Benchmarking Ethics
              </h3>
              <p>
                While we encourage learning from peer performance data, members must:
              </p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>
                  Understand that FranchiseOS anonymizes data to prevent identifying
                  competitors
                </li>
                <li>Not attempt to reverse-engineer or identify other franchises from data</li>
                <li>Use insights to improve their own performance, not harm others</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                6.2 Fair Practices
              </h3>
              <p>Members must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Compete fairly with other franchises</li>
                <li>Not engage in predatory or deceptive practices</li>
                <li>Not violate antitrust or competition laws</li>
                <li>Comply with franchise relationship laws</li>
              </ul>
            </section>

            {/* Reporting Violations */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                7. Reporting Violations
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                7.1 How to Report
              </h3>
              <p>
                If you witness or experience a violation of these rules, please report it to us:
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:conduct@franchiseos.com" className="text-rausch hover:underline">
                    conduct@franchiseos.com
                  </a>
                </p>
                <p>
                  <strong>Report Form:</strong> Use the in-app &quot;Report Abuse&quot; button for specific violations
                </p>
                <p>
                  <strong>Anonymous Reports:</strong> Anonymous reports accepted and reviewed
                </p>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                7.2 Investigation Process
              </h3>
              <p>When a report is submitted:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Our team will review the report within 48 hours</li>
                <li>We may contact you for additional information</li>
                <li>We will investigate impartially and document our findings</li>
                <li>We will maintain reporter confidentiality when possible</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                7.3 False Reports
              </h3>
              <p>
                False or malicious reports made in bad faith may result in disciplinary action
                against the reporter, up to and including account termination.
              </p>
            </section>

            {/* Enforcement & Consequences */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                8. Enforcement & Consequences
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                8.1 Levels of Violation
              </h3>
              <p>
                FranchiseOS categorizes violations and applies progressive enforcement:
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-ink">Minor Violations</h4>
                  <p className="mt-2">
                    First-time minor violations (e.g., single rude comment):
                  </p>
                  <ul className="mt-2 space-y-1 pl-6 list-disc">
                    <li>Verbal warning or email reminder</li>
                    <li>Content removed if necessary</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-ink">Moderate Violations</h4>
                  <p className="mt-2">
                    Repeated minor violations or first-time moderate violations (e.g., harassment,
                    spam):
                  </p>
                  <ul className="mt-2 space-y-1 pl-6 list-disc">
                    <li>Written warning</li>
                    <li>Temporary feature restrictions (e.g., messaging suspension)</li>
                    <li>Mandatory review of Community Rules</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-ink">Serious Violations</h4>
                  <p className="mt-2">
                    Serious violations (e.g., fraud, threats, illegal activity):
                  </p>
                  <ul className="mt-2 space-y-1 pl-6 list-disc">
                    <li>Account suspension (temporary or permanent)</li>
                    <li>Data access restrictions</li>
                    <li>Referral to law enforcement if necessary</li>
                  </ul>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                8.2 Account Suspension & Termination
              </h3>
              <p>FranchiseOS may suspend or terminate an account for:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Repeated violations of Community Rules</li>
                <li>Serious or egregious violations</li>
                <li>Illegal activity</li>
                <li>Fraud or misrepresentation</li>
                <li>Security threats</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                8.3 Appeals Process
              </h3>
              <p>
                Members may appeal disciplinary actions within 30 days of notification:
              </p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>
                  Submit appeal to{" "}
                  <a href="mailto:conduct@franchiseos.com" className="text-rausch hover:underline">
                    conduct@franchiseos.com
                  </a>
                </li>
                <li>Provide new evidence or context</li>
                <li>A different member of our team will review the appeal</li>
                <li>Decision will be communicated within 14 days</li>
              </ul>
            </section>

            {/* Special Provisions */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                9. Special Provisions for Franchisor/Franchisee Relationships
              </h2>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                9.1 Franchisor Responsibilities
              </h3>
              <p>Franchisors using FranchiseOS must:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Comply with franchise disclosure laws</li>
                <li>Not use FranchiseOS insights to unreasonably restrict franchisees</li>
                <li>Respect franchisee privacy and autonomy</li>
                <li>Not punish franchisees solely for data visibility</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                9.2 Franchisee Rights
              </h3>
              <p>Franchisees have the right to:</p>
              <ul className="mt-4 space-y-2 pl-6 list-disc">
                <li>Control their own operational data</li>
                <li>Privacy regarding their performance vs. franchisor oversight</li>
                <li>Appeal data access decisions they believe are unfair</li>
              </ul>

              <h3 className="mt-6 text-xl font-semibold text-ink">
                9.3 Dispute Resolution
              </h3>
              <p>
                FranchiseOS is not responsible for franchise relationship disputes. For
                conflicts between franchisor and franchisee, parties should pursue resolution
                through established franchise dispute mechanisms, not FranchiseOS support.
              </p>
            </section>

            {/* Amendments */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                10. Amendments & Updates
              </h2>
              <p>
                FranchiseOS reserves the right to modify these Community Rules at any time.
                Material changes will be communicated via email and in-app notification.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-ink">
                11. Contact Information
              </h2>
              <p>
                For questions about Community Rules or to report violations:
              </p>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Conduct & Community:</strong>{" "}
                  <a href="mailto:conduct@franchiseos.com" className="text-rausch hover:underline">
                    conduct@franchiseos.com
                  </a>
                </p>
                <p>
                  <strong>Legal Inquiries:</strong>{" "}
                  <a href="mailto:legal@franchiseos.com" className="text-rausch hover:underline">
                    legal@franchiseos.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
