import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | BenchBook.AI",
  description: "Terms of service for BenchBook.AI judicial research platform.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <header className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-sm">
              B
            </div>
            <span className="font-semibold text-lg text-white">BenchBook.AI</span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-medium hover:bg-amber-400 transition text-sm"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last updated: April 4, 2026</p>

        <div className="space-y-10 leading-relaxed">
          <Section title="1. Agreement">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of BenchBook.AI (&ldquo;Service&rdquo;),
              operated by Velocity Venture Holdings, LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;).
              By creating an account or using the Service, you agree to these Terms. If you do not agree,
              do not use the Service.
            </p>
          </Section>

          <Section title="2. Service Description">
            <p>
              BenchBook.AI is a subscription-based AI legal research platform designed for Tennessee
              judicial officers. The Service provides AI-powered research assistance using Tennessee
              statutes (T.C.A.), Rules of Juvenile Practice and Procedure (TRJPP), Department of
              Children&apos;s Services (DCS) policies, and local court rules.
            </p>
          </Section>

          <Section title="3. No Legal Advice">
            <p className="text-white font-medium bg-slate-900 border border-amber-500/30 rounded-lg p-4">
              BenchBook.AI is a research tool, not a lawyer. The Service does not provide legal advice,
              legal opinions, or legal representation. AI-generated responses are informational only and
              may contain errors. You are solely responsible for verifying all citations, legal analysis,
              and conclusions before relying on them in any judicial or legal proceeding.
            </p>
            <p>
              The Company, its officers, and its affiliates shall not be liable for any judicial decision,
              order, or action taken based on information provided by the Service.
            </p>
          </Section>

          <Section title="4. AI Accuracy Limitations">
            <p>
              The AI research assistant is powered by large language models that, despite safeguards:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>May occasionally cite statutes, rules, or policies incorrectly</li>
              <li>May generate plausible-sounding but inaccurate legal analysis</li>
              <li>May not reflect the most recent statutory amendments or rule changes</li>
              <li>May miss relevant authorities or provide incomplete analysis</li>
            </ul>
            <p>
              We implement citation verification to flag unverified references, but this system is not
              infallible. <strong className="text-white">Always verify AI-generated citations against
              the original source text before citing them in any proceeding.</strong>
            </p>
          </Section>

          <Section title="5. Subscription Plans and Billing">
            <p><strong className="text-white">Plans:</strong></p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Solo Judge</strong> &mdash; $79/month or $790/year (save $158). Single user license.</li>
              <li><strong className="text-white">Court Package</strong> &mdash; $229/month or $2,290/year (save $458). Up to 5 user seats with court-specific customization.</li>
            </ul>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable
              except as required by applicable law or as described in Section 6.
            </p>
            <p>
              We reserve the right to modify pricing with 30 days&apos; written notice. Price changes
              take effect at the start of the next billing period.
            </p>
          </Section>

          <Section title="6. Cancellation and Refunds">
            <p>
              You may cancel your subscription at any time through your account settings or by contacting
              <a href="mailto:support@benchbook.ai" className="text-amber-400 hover:underline"> support@benchbook.ai</a>.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Monthly plans:</strong> Access continues through the end of the current billing period. No partial refunds.</li>
              <li><strong className="text-white">Annual plans:</strong> You may request a pro-rated refund within the first 30 days. After 30 days, access continues through the end of the annual term with no refund.</li>
            </ul>
            <p>
              Upon cancellation, your account data (chat history, research patterns) is retained for
              30 days and then permanently deleted. You may request immediate deletion at any time.
            </p>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Service only for legitimate legal research purposes</li>
              <li>Not submit real case data, party names, or confidential information in research queries</li>
              <li>Not attempt to circumvent rate limits, access controls, or security measures</li>
              <li>Not share your account credentials with unauthorized users</li>
              <li>Not use automated scripts or bots to access the Service</li>
              <li>Not use the Service for any unlawful purpose</li>
            </ul>
            <p>
              Court Package seat licenses are for named judicial officers and court staff within a single
              court. Sharing credentials outside the licensed court is prohibited.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The BenchBook.AI platform, including its design, code, and AI system prompts, is the
              property of Velocity Venture Holdings, LLC. The Tennessee legal corpus (T.C.A., TRJPP,
              DCS policies) is public domain content and is not claimed as our intellectual property.
            </p>
            <p>
              Your research queries and chat sessions are your property. We claim no ownership over
              your input or the AI-generated responses you receive.
            </p>
          </Section>

          <Section title="9. Service Availability">
            <p>
              We strive for high availability but do not guarantee uninterrupted access. The Service
              may be temporarily unavailable due to maintenance, updates, or circumstances beyond our
              control. We will provide reasonable notice of planned downtime when possible.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO
              LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE SERVICE
              SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms are governed by the laws of the State of Tennessee. Any disputes shall be
              resolved in the state or federal courts located in Shelby County, Tennessee.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these Terms periodically. Material changes will be communicated via email
              at least 30 days before taking effect. Continued use of the Service after changes
              constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions about these Terms should be directed to:<br />
              <a href="mailto:support@benchbook.ai" className="text-amber-400 hover:underline">support@benchbook.ai</a><br />
              Velocity Venture Holdings, LLC<br />
              Tipton County, Tennessee
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-slate-500">
          <span>&copy; 2026 Velocity Venture Holdings, LLC</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-amber-400 mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
