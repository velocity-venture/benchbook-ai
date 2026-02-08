"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <a
            href="#waitlist"
            className="px-4 py-2 bg-amber-500 text-slate-950 rounded-lg font-medium hover:bg-amber-400 transition"
          >
            Join Waitlist
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-8">
            Built by a Judge, for Judges
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            AI-Powered Legal Intelligence for{" "}
            <span className="text-amber-400">Juvenile Court</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Research Tennessee law, manage your docket, and generate court
            documents — all in one secure platform designed specifically for
            Juvenile Court Judges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="px-8 py-4 bg-amber-500 text-slate-950 rounded-xl font-semibold text-lg hover:bg-amber-400 transition"
            >
              Request Early Access
            </a>
            <a
              href="#features"
              className="px-8 py-4 border border-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-800 transition"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm uppercase tracking-wider mb-4">
            Designed for Tennessee Courts
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400">
            <span>T.C.A. Integrated</span>
            <span>•</span>
            <span>FERPA Compliant</span>
            <span>•</span>
            <span>Secure & Encrypted</span>
            <span>•</span>
            <span>Made in Tennessee</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">
            Everything a Juvenile Court Judge Needs
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "AI Legal Research",
                desc: "Ask questions in plain English. Get answers with T.C.A. citations and relevant case law instantly.",
              },
              {
                icon: "📋",
                title: "Smart Docket",
                desc: "See your entire caseload at a glance. Track deadlines, reviews, and upcoming hearings.",
              },
              {
                icon: "📝",
                title: "Case Notes",
                desc: "Structured templates for juvenile cases. AI-assisted summaries. Full search across all notes.",
              },
              {
                icon: "📄",
                title: "Document Generation",
                desc: "Generate detention orders, dispositions, and transfers with one click. Customizable templates.",
              },
              {
                icon: "✅",
                title: "Compliance Tracking",
                desc: "Never miss a FERPA deadline or detention review. Automatic reminders and audit trails.",
              },
              {
                icon: "🔒",
                title: "Secure by Design",
                desc: "End-to-end encryption. US-only hosting. Built for the sensitivity of juvenile records.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-slate-900 border border-slate-800 rounded-2xl"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-medium mb-6">
            "I've spent 20 years on the bench. This is the first tool that
            actually understands what juvenile court judges need."
          </blockquote>
          <p className="text-slate-400">
            — M.O. Eckel III, Juvenile Court Judge, Tipton County TN
          </p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 mb-12">
            No enterprise sales calls. No hidden fees. Start in minutes.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$199",
                desc: "Core features for individual judges",
                features: ["AI Legal Research", "Case Notes", "Document Templates"],
              },
              {
                name: "Professional",
                price: "$299",
                desc: "Full platform with analytics",
                features: ["Everything in Starter", "Docket Management", "Compliance Tracking", "Priority Support"],
                popular: true,
              },
              {
                name: "Court",
                price: "$499",
                desc: "Multi-user for entire court",
                features: ["Everything in Pro", "Multiple Users", "Admin Dashboard", "Custom Integrations"],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border ${
                  plan.popular
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                {plan.popular && (
                  <div className="text-amber-400 text-sm font-medium mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="text-4xl font-bold my-4">
                  {plan.price}
                  <span className="text-lg text-slate-400">/mo</span>
                </div>
                <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>
                <ul className="text-left space-y-2">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span className="text-amber-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-24 px-6 bg-gradient-to-b from-transparent to-amber-500/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Early Access</h2>
          <p className="text-slate-400 mb-8">
            We're launching soon with a limited beta for Tennessee judges.
            Join the waitlist to be first in line.
          </p>
          {submitted ? (
            <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium">
                {message || "You're on the list! We'll be in touch soon."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-semibold hover:bg-amber-400 transition disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
          )}
          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
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
            © 2026 Velocity Venture Holdings, LLC. Made in Tennessee.
          </p>
        </div>
      </footer>
    </div>
  );
}
