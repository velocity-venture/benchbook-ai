"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Scale,
  BookOpen,
  FileText,
  Search,
  Lock,
  BarChart3,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitState("loading");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("waitlist")
        .insert({ email: email.toLowerCase().trim(), source: "landing_page" });

      if (error) {
        if (error.code === "23505") {
          setSubmitState("duplicate");
        } else {
          throw error;
        }
      } else {
        setSubmitState("success");
        console.log("[conversion] waitlist_signup", { source: "landing_page" });
      }
      setEmail("");
    } catch {
      setSubmitState("error");
    }

    setTimeout(() => setSubmitState("idle"), 4000);
  }

  return (
    <div className="min-h-screen text-slate-900" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#B85C38] rounded-lg flex items-center justify-center font-bold text-white text-sm">
              B
            </div>
            <span className="font-semibold text-lg">
              BenchBook<span className="text-[#B85C38]">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition hidden sm:block">
              Pricing
            </a>
            <a href="#about" className="text-sm text-slate-600 hover:text-slate-900 transition hidden sm:block">
              About
            </a>
            <Link
              href="/login"
              className="px-5 py-2 bg-[#B85C38] text-white rounded-lg font-medium hover:bg-[#a04e2f] transition text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-[85vh] flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#B85C38] blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-[#B85C38] blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                Your Bench. <br />
                <span className="text-[#B85C38]">Your Brain.</span> <br />
                Amplified.
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The judicial productivity platform that understands the weight of your
                decisions and the pressure of your docket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#waitlist"
                  className="bg-[#B85C38] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#a04e2f] transition text-center"
                >
                  Join the Waitlist
                </a>
                <Link
                  href="/login"
                  className="border border-[#B85C38] text-[#B85C38] px-8 py-4 rounded-lg font-medium hover:bg-[#B85C38] hover:text-white transition text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </FadeIn>

            <FadeIn>
              <div className="bg-white/80 backdrop-blur border border-[#B85C38]/20 rounded-xl p-6">
                <div className="text-sm text-slate-500 mb-3">Demo Query</div>
                <div className="bg-white rounded-lg p-4 mb-4 border">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    What are the grounds for termination of parental rights in Tennessee?
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-sm">
                  <div className="font-medium text-slate-700 mb-2">
                    Tennessee Code &sect; 36-1-113 Analysis:
                  </div>
                  <div className="text-slate-600 leading-relaxed">
                    <p className="mb-2">
                      Found <strong>4 relevant grounds</strong> including abandonment
                      (12+ months), severe abuse, failure to remedy conditions, and
                      persistent conditions. Cross-referenced with TN Court of Appeals
                      precedent.
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      Demo response — actual BenchBook queries cite full statute text
                      with procedural requirements.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-8" style={{ fontFamily: "'Georgia', serif" }}>
              Every judge knows the feeling.
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { stat: "127", desc: "Average annual juvenile caseload per judge" },
                { stat: "3.2hrs", desc: "Daily time spent on legal research" },
                { stat: "40+", desc: "Statute changes tracked annually" },
              ].map((item, i) => (
                <div key={i} className="p-6">
                  <div className="text-4xl font-bold text-[#B85C38] mb-2">{item.stat}</div>
                  <div className="text-slate-600">{item.desc}</div>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn>
            <p className="text-xl text-slate-600 mt-12 leading-relaxed">
              The pressure never stops. Cases pile up. Statutes change. Precedents
              evolve. Meanwhile, you&apos;re expected to make decisions that change
              lives with perfect accuracy and judicial temperament.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: "'Georgia', serif" }}>
              Built for the bench, designed for your brain.
            </h2>
          </FadeIn>

          <FadeIn>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Research — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-slate-200 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#B85C38]/10 rounded-lg flex items-center justify-center">
                    <Search className="w-6 h-6 text-[#B85C38]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                      AI Research Assistant
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Ask complex legal questions in plain language. Get Tennessee-specific
                      answers with statute citations, case law, and procedural guidance.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                      <span className="text-slate-500">Query:</span>{" "}
                      <span className="text-slate-700">
                        &ldquo;Emergency custody standards for domestic violence cases&rdquo;
                      </span>
                      <br />
                      <span className="text-slate-500">Response:</span>{" "}
                      <span className="text-slate-700">
                        T.C.A. &sect; 36-6-106 emergency provisions, 4 case precedents found...
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 border border-slate-200 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#B85C38]/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-[#B85C38]" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                  Case Pattern Analysis
                </h3>
                <p className="text-slate-600">
                  Identify trends across your docket. Spot recurring issues before they
                  become problems.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 border border-slate-200 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-[#B85C38]/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[#B85C38]" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                  Smart Statute Browser
                </h3>
                <p className="text-slate-600">
                  Navigate Tennessee statutes with context. See related provisions and
                  recent amendments automatically.
                </p>
              </div>

              {/* Document Drafting — spans 2 cols */}
              <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-slate-200 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#B85C38]/10 rounded-lg flex items-center justify-center">
                    <Pencil className="w-6 h-6 text-[#B85C38]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                      Judicial Document Drafting
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Generate orders, findings, and rulings with proper Tennessee
                      citations and procedural requirements. Your voice, your reasoning,
                      done faster.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm">
                      <span className="text-slate-500">Template:</span>{" "}
                      <span className="text-slate-700">
                        Custody modification order with safety plan requirements
                      </span>
                      <br />
                      <span className="text-slate-500">Output:</span>{" "}
                      <span className="text-slate-700">
                        Court-ready document with statute citations and standard language
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Corpus Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "'Georgia', serif" }}>
              What&apos;s Inside
            </h2>
          </FadeIn>
          <FadeIn>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: BookOpen, label: "Tennessee Code", stat: "ALL", desc: "Complete Title 37 (Juveniles) and Title 36 (Domestic Relations)", color: "text-blue-600 bg-blue-50" },
                { icon: Scale, label: "TRJPP Rules", stat: "ALL", desc: "Complete Tennessee Rules of Juvenile Practice and Procedure", color: "text-orange-600 bg-orange-50" },
                { icon: FileText, label: "DCS Policies", stat: "ALL", desc: "Complete DCS policies and procedures, plus county local rules on request", color: "text-green-600 bg-green-50" },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl text-center hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{item.label}</h3>
                  <p className="text-3xl font-bold text-[#B85C38] mb-2">{item.stat}</p>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn className="mt-8">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Lock className="w-4 h-4" />
              <span>Closed legal universe — every answer sourced from vetted Tennessee law. No internet searches. No hallucinated citations.</span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Built From The Bench */}
      <section id="about" className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                Built from the bench.
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                BenchBook wasn&apos;t built by a tech company. It was built by a judge
                who got tired of the same problems you face every day.
              </p>
            </div>
          </FadeIn>
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                  The difference matters.
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  While other legal tech platforms are built by developers guessing at
                  what judges need, BenchBook was created by someone who sits behind
                  the bench every day. Someone who knows the weight of a custody
                  decision at 4:47 PM on Friday.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Judge M.O. Eckel III didn&apos;t build this for Silicon Valley. He
                  built it for Tennessee courtrooms. For the moments when you need
                  answers fast and they need to be right.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8">
                <blockquote className="text-lg text-slate-700 italic mb-4">
                  &ldquo;I built BenchBook because I needed it. Every day I face
                  decisions that change families forever. I needed tools that understand
                  the gravity of that responsibility.&rdquo;
                </blockquote>
                <div className="text-[#B85C38] font-medium">
                  &mdash; Judge M.O. Eckel III
                  <br />
                  <span className="text-slate-500 text-sm">
                    General Sessions &amp; Juvenile Court Judge, Tipton County
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Georgia', serif" }}>
                Pricing built for courts, not corporations.
              </h2>
              <p className="text-xl text-slate-600">
                10 months for the price of 12 when you pay annually.
              </p>
            </div>
          </FadeIn>

          <FadeIn>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Solo Plan */}
              <div className="bg-white rounded-xl p-8 border border-slate-200 hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
                <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                  Solo Plan
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-slate-600">/month</span>
                  <div className="text-sm text-slate-500 mt-1">or $790/year (save $158)</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Unlimited AI research queries",
                    "Tennessee statute browser",
                    "Document drafting templates",
                    "Case pattern analysis",
                    "Email support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <span className="text-[#B85C38]">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block text-center border border-[#B85C38] text-[#B85C38] py-3 rounded-lg font-medium hover:bg-[#B85C38] hover:text-white transition"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Court Package */}
              <div className="bg-white rounded-xl p-8 border-2 border-[#B85C38] hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#B85C38] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                  Court Package
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$229</span>
                  <span className="text-slate-600">/month</span>
                  <div className="text-sm text-slate-500 mt-1">or $2,290/year (save $458)</div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Everything in Solo Plan",
                    "Up to 5 judicial users",
                    "Court administrator dashboard",
                    "Shared templates & workflows",
                    "Court-specific customization",
                    "Priority support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700">
                      <span className="text-[#B85C38]">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block text-center bg-[#B85C38] text-white py-3 rounded-lg font-medium hover:bg-[#a04e2f] transition"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: "'Georgia', serif" }}>
              Join the waitlist.
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Launching with Tennessee Juvenile Court judges first. Be among the first
              to experience judicial productivity built by judges.
            </p>
          </FadeIn>

          <FadeIn>
            <form onSubmit={handleWaitlist}>
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your judicial email address"
                  required
                  className="flex-1 px-6 py-4 border border-slate-300 rounded-lg focus:outline-none focus:border-[#B85C38] transition"
                />
                <button
                  type="submit"
                  disabled={submitState === "loading"}
                  className={`px-8 py-4 rounded-lg font-medium transition whitespace-nowrap ${
                    submitState === "success" || submitState === "duplicate"
                      ? "bg-green-500 text-white"
                      : submitState === "error"
                      ? "bg-red-500 text-white"
                      : "bg-[#B85C38] text-white hover:bg-[#a04e2f]"
                  }`}
                >
                  {submitState === "loading"
                    ? "Joining..."
                    : submitState === "success"
                    ? "You're in!"
                    : submitState === "duplicate"
                    ? "You're already on the list!"
                    : submitState === "error"
                    ? "Something went wrong"
                    : "Join Waitlist"}
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                No spam. Just updates on launch progress and early access opportunities.
              </p>
            </form>
          </FadeIn>
        </div>
      </section>

      {/* Schedule Demo CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Georgia', serif" }}>
              Want a personal walkthrough?
            </h2>
            <p className="text-slate-600 mb-8">
              Schedule a 15-minute demo and see how BenchBook.AI can transform your
              daily research workflow.
            </p>
            <a
              href="mailto:demo@benchbook.ai?subject=BenchBook.AI Demo Request"
              className="inline-block border border-[#B85C38] text-[#B85C38] px-8 py-4 rounded-lg font-medium hover:bg-[#B85C38] hover:text-white transition"
            >
              Schedule Demo
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold mb-4" style={{ fontFamily: "'Georgia', serif" }}>
                BenchBook<span className="text-[#B85C38]">.AI</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Judicial productivity platform built by a judge for judges. Research
                faster, draft better, decide with confidence.
              </p>
              <div className="text-sm text-slate-500">
                A Velocity Venture Holdings product
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#about" className="hover:text-white transition">About</a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">Pricing</a>
                </li>
                <li>
                  <a href="#waitlist" className="hover:text-white transition">Early Access</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="mailto:support@benchbook.ai" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
            <p>&copy; 2026 BenchBook.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
