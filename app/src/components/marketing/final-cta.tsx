"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: integrate with waitlist API
    setSubmitted(true);
  };

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] to-[#060a14]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.08),transparent_60%)]" />

      {/* Glow orbs */}
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-[128px]" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Your Bench?
            </span>
          </h2>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-12">
            Join Tennessee judges who are already researching smarter.
            Start your 14-day free trial — no credit card required.
          </p>
        </motion.div>

        {/* Email capture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-amber-500/30 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                Get Early Access
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl max-w-md mx-auto">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">
                You&apos;re on the list. We&apos;ll be in touch soon.
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/login"
            className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] rounded-xl font-semibold text-lg shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="mailto:contact@benchbook.ai"
            className="px-8 py-4 border border-slate-700/50 bg-white/5 backdrop-blur-sm rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-slate-600 transition-all flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Schedule a Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
