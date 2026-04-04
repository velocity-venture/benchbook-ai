import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | BenchBook.AI",
  description: "Privacy policy for BenchBook.AI judicial research platform.",
};

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last updated: April 4, 2026</p>

        <div className="space-y-10 leading-relaxed">
          <Section title="1. Who We Are">
            <p>
              BenchBook.AI is operated by <strong className="text-white">Velocity Venture Holdings, LLC</strong>,
              a Tennessee limited liability company. This policy describes how we collect, use, and protect
              information when you use the BenchBook.AI platform (&ldquo;Service&rdquo;).
            </p>
            <p>
              Contact: <a href="mailto:support@benchbook.ai" className="text-amber-400 hover:underline">support@benchbook.ai</a>
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong className="text-white">Account Information:</strong> Email address, name, and court affiliation provided during registration.</p>
            <p><strong className="text-white">Research Queries:</strong> Questions you submit through the AI legal research chat. These are stored to provide session history, enable multi-turn conversations, and analyze your personal research patterns.</p>
            <p><strong className="text-white">Research Patterns:</strong> Aggregated, per-user analytics about the legal topics, statutes, and areas you research most frequently. This data is visible only to you and helps surface relevant suggestions.</p>
            <p><strong className="text-white">Chat Feedback:</strong> Thumbs up/down ratings and bookmarks you provide on AI responses, used to improve response quality.</p>
            <p><strong className="text-white">Usage Data:</strong> Standard server logs including IP addresses, browser type, and access times for security monitoring and service reliability.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li>Provide AI-powered legal research responses with verified citations</li>
              <li>Maintain your chat session history and research patterns</li>
              <li>Authenticate your account and enforce subscription access</li>
              <li>Rate-limit API usage to ensure fair service for all users</li>
              <li>Improve the accuracy and relevance of legal research responses</li>
              <li>Communicate service updates and account-related notifications</li>
            </ul>
          </Section>

          <Section title="4. Anthropic API (Claude)">
            <p>
              Research queries are sent to <strong className="text-white">Anthropic&apos;s Claude API</strong> for
              processing. When you submit a question, your query text and conversation history are transmitted to
              Anthropic&apos;s servers to generate a response. Anthropic processes this data according to their
              commercial API terms, which prohibit using API inputs for model training.
            </p>
            <p>
              The legal corpus (Tennessee statutes, rules, and policies) is included as context with your query.
              No personal case data, party names, or case numbers should be included in queries. The system is
              designed for legal research, not case management.
            </p>
          </Section>

          <Section title="5. Data Storage">
            <p>
              Your data is stored in <strong className="text-white">Supabase</strong> (hosted on AWS in the US East region).
              All data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Row-level security policies ensure
              users can only access their own data.
            </p>
            <p>
              We retain chat history and research patterns for the duration of your active subscription.
              Upon account deletion or subscription cancellation, your data is permanently deleted within 30 days.
            </p>
          </Section>

          <Section title="6. No Real Case Data">
            <p>
              BenchBook.AI is a <strong className="text-white">legal research tool</strong>, not a case management system.
              The Service does not store, process, or have access to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Case files, docket entries, or court records</li>
              <li>Names of parties, children, or families</li>
              <li>Social Security numbers or other personally identifiable information of third parties</li>
              <li>Sealed or confidential court documents</li>
            </ul>
            <p>
              Users should not include real case details, party names, or identifying information in research queries.
            </p>
          </Section>

          <Section title="7. CJIS Compliance Posture">
            <p>
              While BenchBook.AI does not process Criminal Justice Information (CJI) as defined by the FBI&apos;s
              CJIS Security Policy, we maintain security practices aligned with CJIS principles:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Encryption in transit and at rest</li>
              <li>Authentication required for all access</li>
              <li>Per-user access controls with row-level security</li>
              <li>Audit logging of authentication events</li>
              <li>No storage of criminal justice records or case data</li>
            </ul>
          </Section>

          <Section title="8. Data Sharing">
            <p>
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Anthropic</strong> — query text for AI processing (see Section 4)</li>
              <li><strong className="text-white">Supabase/AWS</strong> — infrastructure hosting</li>
              <li><strong className="text-white">Cloudflare</strong> — CDN, DDoS protection, and edge hosting</li>
            </ul>
            <p>
              We may disclose information if required by law, court order, or to protect the rights and safety
              of our users and the public.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>You may at any time:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access and export your research history</li>
              <li>Delete individual chat sessions</li>
              <li>Request complete account and data deletion</li>
              <li>Update your account information</li>
            </ul>
            <p>
              To exercise these rights, contact <a href="mailto:support@benchbook.ai" className="text-amber-400 hover:underline">support@benchbook.ai</a>.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy periodically. Material changes will be communicated via email
              to registered users. Continued use of the Service after changes constitutes acceptance
              of the updated policy.
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-slate-500">
          <span>&copy; 2026 Velocity Venture Holdings, LLC</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
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
