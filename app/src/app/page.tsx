import Link from "next/link";
import { Scale, BookOpen, FileText, MessageSquare, Lock, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950">
              B
            </div>
            <span className="font-semibold text-lg">BenchBook AI</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-medium hover:bg-amber-400 transition"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-8">
            Built by a Judge, for Judges
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Your Digital{" "}
            <span className="text-amber-400">Bench Book</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Ask compliance questions, get cited answers from all of Title 36 & 37 TCA, 
            complete TRJPP rules, all DCS policies and procedures, plus your county's 
            local juvenile court rules. A comprehensive legal universe built for Tennessee Juvenile Court.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-amber-500 text-slate-950 rounded-xl font-semibold text-lg hover:bg-amber-400 transition"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-4 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Corpus Stats */}
      <section className="border-y border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-4">
            Closed Legal Universe
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <span>6,325 vectors</span>
            <span>&bull;</span>
            <span>All Title 36 & 37 TCA</span>
            <span>&bull;</span>
            <span>Complete TRJPP</span>
            <span>&bull;</span>
            <span>All DCS policies</span>
            <span>&bull;</span>
            <span>+ County local rules</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Research, Not Case Management
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Legal Research</h3>
              <p className="text-slate-400">
                Ask questions in plain English. Get answers with complete Title 36 & 37 TCA citations,
                TRJPP rule references, all DCS policy guidance, and county local rules — all sourced and verifiable.
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse the Corpus</h3>
              <p className="text-slate-400">
                Explore all Title 36 & 37 TCA sections, complete TRJPP rules, all DCS policies and procedures, 
                plus county-specific local rules. Search by keyword, browse by topic, and drill into the full text.
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Closed Legal Universe</h3>
              <p className="text-slate-400">
                Every answer comes from vetted Tennessee legal sources — no internet
                searches, no hallucinated citations. Secure, private, and auditable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-medium mb-6">
            &ldquo;I&apos;ve spent 20 years on the bench. This is the first tool that
            actually understands what juvenile court judges need.&rdquo;
          </blockquote>
          <p className="text-slate-400">
            &mdash; M.O. Eckel III, Juvenile Court Judge, Tipton County TN
          </p>
        </div>
      </section>

      {/* Corpus Breakdown */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What&apos;s Inside
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Tennessee Code</h3>
              <p className="text-3xl font-bold text-blue-400 mb-2">ALL</p>
              <p className="text-sm text-slate-400">
                Complete Title 37 (Juveniles) and Title 36 (Domestic Relations)
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Scale className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">TRJPP Rules</h3>
              <p className="text-3xl font-bold text-orange-400 mb-2">ALL</p>
              <p className="text-sm text-slate-400">
                Complete Tennessee Rules of Juvenile Practice and Procedure
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">DCS Policies</h3>
              <p className="text-3xl font-bold text-green-400 mb-2">ALL</p>
              <p className="text-sm text-slate-400">
                Complete DCS policies and procedures, plus county local rules on request
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center font-bold text-xs text-slate-950">
              B
            </div>
            <span className="font-semibold">BenchBook AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; 2026 Velocity Venture Holdings, LLC. Made in Tennessee.
          </p>
        </div>
      </footer>
    </div>
  );
}
