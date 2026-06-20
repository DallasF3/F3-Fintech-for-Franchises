import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | FranchiseOS",
  description: "General terms and conditions for using the FranchiseOS website.",
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col pt-[72px]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            Terms and Conditions
          </h1>
          <p className="mt-4 text-lg text-muted">
            Effective Date: [Effective Date]
          </p>

          <div className="prose prose-sm mt-12 max-w-none space-y-8 text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-ink">1. Introduction</h2>
              <p>
                These Terms and Conditions govern your use of the FranchiseOS website ([Website URL]). By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use FranchiseOS's website if you do not accept all of the terms and conditions stated on this page.
              </p>
              <p>
                <strong>Note to Subscribers:</strong> If you are a registered user of our SaaS platform, your use of the application is governed by our <Link href="/terms" className="text-rausch hover:underline">Terms of Service</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">2. License</h2>
              <p>
                Unless otherwise stated, FranchiseOS and/or its licensors own the intellectual property rights for all material on the website. All intellectual property rights are reserved. You may view and/or print pages from [Website URL] for your own personal use subject to restrictions set in these terms and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">3. Restrictions</h2>
              <p>You are specifically restricted from all of the following:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Publishing any website material in any other media without prior consent.</li>
                <li>Selling, sublicensing, and/or otherwise commercializing any website material.</li>
                <li>Using this website in any way that is or may be damaging to this website.</li>
                <li>Using this website in any way that impacts user access to this website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">4. No Warranties</h2>
              <p>
                This website is provided "as is," with all faults, and FranchiseOS expresses no representations or warranties of any kind related to this website or the materials contained on this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink">5. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
